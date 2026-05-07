import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { CollectionsService } from './collections.service';

const router = Router();

/* =========================================================================
   1. Public 라우트
   ========================================================================= */

/**
 * GET /api/collections
 * 활성화된(공개된) 컬렉션 목록 조회
 */
router.get('/collections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CollectionsService.getCollections(true); // 오직 공개된 컬렉션만
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/collections/:id
 * 특정 컬렉션의 세부 정보 및 소속 수록물 일체 조회 (순서 정렬)
 */
router.get('/collections/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 컬렉션 ID가 아닙니다.',
      });
    }

    const collection = await CollectionsService.getCollectionById(id);
    if (!collection) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: '해당하는 컬렉션을 찾을 수 없습니다.',
      });
    }

    return res.json(collection);
  } catch (error) {
    return next(error);
  }
});


/* =========================================================================
   2. Admin 전용 라우트
   ========================================================================= */

/**
 * GET /api/admin/collections
 * 전체 컬렉션 리스트 조회 (비공개 포함)
 */
router.get('/admin/collections', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await CollectionsService.getCollections(false); // 비공개 컬렉션도 포함해 전부
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/collections
 * 신규 컬렉션 생성
 */
router.post('/admin/collections', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, coverImageId, isPublished } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '컬렉션의 타이틀(title)은 필수 입력항목입니다.',
      });
    }

    const collection = await CollectionsService.createCollection({
      title,
      description,
      coverImageId: coverImageId ? parseInt(coverImageId, 10) : undefined,
      isPublished,
    });

    return res.status(211).json(collection);
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/admin/collections/:id
 * 기존 컬렉션 메타데이터 정보 수정
 */
router.put('/admin/collections/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, description, coverImageId, isPublished } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 컬렉션 ID가 아닙니다.',
      });
    }

    const collection = await CollectionsService.updateCollection(id, {
      title,
      description,
      coverImageId: coverImageId ? parseInt(coverImageId, 10) : undefined,
      isPublished,
    });

    return res.json(collection);
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/admin/collections/:id
 * 특정 컬렉션 영구 삭제
 */
router.delete('/admin/collections/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 컬렉션 ID가 아닙니다.',
      });
    }

    await CollectionsService.deleteCollection(id);
    return res.json({ success: true, message: '컬렉션이 성공적으로 완전 제거되었습니다.' });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/collections/:id/items
 * 특정 컬렉션에 아이템 신규 수록
 * - 중복된 등록 시도일 경우 409 Conflict 반환
 */
router.post('/admin/collections/:id/items', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collectionId = parseInt(req.params.id, 10);
    const { contentType, contentId } = req.body;

    if (isNaN(collectionId)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 컬렉션 ID가 아닙니다.',
      });
    }

    if (!contentType || !contentId) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '수록할 대상 contentType 및 contentId는 필수 입력항목입니다.',
      });
    }

    const item = await CollectionsService.addItemToCollection(collectionId, contentType, parseInt(contentId, 10));

    if (!item) {
      return res.status(409).json({
        error: 'CONFLICT',
        message: '이미 이 컬렉션에 수록되어 있는 콘텐츠 아이템입니다.',
      });
    }

    return res.status(211).json(item);
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/admin/collections/:id/items/:itemId
 * 컬렉션에서 특정 아이템 축출
 */
router.delete('/admin/collections/:id/items/:itemId', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collectionId = parseInt(req.params.id, 10);
    const itemId = parseInt(req.params.itemId, 10);

    if (isNaN(collectionId) || isNaN(itemId)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 컬렉션 ID 또는 아이템 ID가 아닙니다.',
      });
    }

    await CollectionsService.removeItemFromCollection(collectionId, itemId);
    return res.json({ success: true, message: '컬렉션에서 해당 아이템이 정상 축출되었습니다.' });
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/admin/collections/:id/reorder
 * 컬렉션 내부 수록 아이템들의 진열 배치 순서 일괄 reordering 처리
 */
router.put('/admin/collections/:id/reorder', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collectionId = parseInt(req.params.id, 10);
    const { items } = req.body; // 배열 구조: [{ contentType, contentId, position }]

    if (isNaN(collectionId)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 컬렉션 ID가 아닙니다.',
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'reorder 대상 아이템 목록배열(items)이 누락되었습니다.',
      });
    }

    await CollectionsService.reorderItems(collectionId, items);
    return res.json({ success: true, message: '컬렉션 수록 순서 재정렬이 정상 완료되었습니다.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
