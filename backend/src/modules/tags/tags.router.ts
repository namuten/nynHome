import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { TagsService } from './tags.service';

const router = Router();

/* =========================================================================
   1. Public 라우트
   ========================================================================= */

/**
 * GET /api/tags
 * 전체 태그와 해당 태그 부착된 콘텐츠 카운트 조회
 */
router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await TagsService.getAllTags();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/tags/:slug
 * 특정 태그에 걸려 있는 다차원 콘텐츠(포스트, 쇼케이스 등) 목록 조회
 */
router.get('/tags/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const data = await TagsService.getTagWithContents(slug);

    if (!data) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: '해당하는 태그를 찾지 못했습니다.',
      });
    }

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});


/* =========================================================================
   2. Admin 전용 라우트 (requireAuth, requireAdmin 적용)
   ========================================================================= */

/**
 * POST /api/admin/tags
 * 신규 태그 생성
 */
router.post('/admin/tags', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, color } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '태그 이름(name)과 고유 식별자(slug)는 필수값입니다.',
      });
    }

    const tag = await TagsService.createTag({ name, slug, color });
    return res.status(211).json(tag); // 성공 응답
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/admin/tags/:id
 * 기존 태그 수정
 */
router.put('/admin/tags/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, color } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 태그 ID 번호가 아닙니다.',
      });
    }

    const tag = await TagsService.updateTag(id, { name, slug, color });
    return res.json(tag);
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/admin/tags/:id
 * 특정 태그 제거 (CASCADE 삭제)
 */
router.delete('/admin/tags/:id', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: '유효한 태그 ID 번호가 아닙니다.',
      });
    }

    await TagsService.deleteTag(id);
    return res.json({ success: true, message: '태그가 정상적으로 영구 삭제되었습니다.' });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/content-tags
 * 특정 콘텐츠에 태그 바인딩 연결
 */
router.post('/admin/content-tags', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId, tagId } = req.body;

    if (!contentType || !contentId || !tagId) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'contentType, contentId, tagId 값들은 모두 필수입니다.',
      });
    }

    const record = await TagsService.attachTagToContent(contentType, parseInt(contentId, 10), parseInt(tagId, 10));
    return res.status(211).json(record);
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/admin/content-tags
 * 특정 콘텐츠에서 태그 매핑 제거
 */
router.delete('/admin/content-tags', requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contentType, contentId, tagId } = req.body;

    if (!contentType || !contentId || !tagId) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'contentType, contentId, tagId 값들은 모두 필수입니다.',
      });
    }

    await TagsService.detachTagFromContent(contentType, parseInt(contentId, 10), parseInt(tagId, 10));
    return res.json({ success: true, message: '콘텐츠에서 태그 매핑이 삭제되었습니다.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
