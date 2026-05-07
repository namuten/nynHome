import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../lib/validation';
import * as showcaseService from './showcase.service';
import {
  CreateShowcaseItemSchema,
  UpdateShowcaseItemSchema,
  ReorderShowcaseItemsSchema,
  GetShowcaseQuerySchema,
} from './showcase.types';

const router = Router();

/**
 * public 쇼케이스 아이템 목록 조회
 * GET /api/showcase?locale=ko&category=web&featured=true
 */
router.get('/showcase', validateQuery(GetShowcaseQuerySchema), async (req: Request, res: Response) => {
  try {
    const locale = req.query.locale as 'ko' | 'en' | undefined;
    const category = req.query.category as string | undefined;
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    const items = await showcaseService.getShowcaseItems({ locale, category, featured }, true);
    res.json({ locale: locale || 'ko', items });
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

/**
 * public 쇼케이스 상세 조회 (슬러그 기준)
 * GET /api/showcase/:slug
 */
router.get('/showcase/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const item = await showcaseService.getShowcaseItemBySlug(slug, true);
    if (!item) {
      return res.status(404).json({ error: 'NOT_FOUND', message: '해당 쇼케이스 작품을 찾을 수 없습니다.' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

/**
 * 어드민 쇼케이스 신규 추가
 * POST /api/admin/showcase
 */
router.post(
  '/admin/showcase',
  requireAuth,
  requireAdmin,
  validateBody(CreateShowcaseItemSchema),
  async (req: Request, res: Response) => {
    try {
      const item = await showcaseService.createShowcaseItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      if (err.message === 'SLUG_DUPLICATE') {
        return res.status(409).json({ error: 'SLUG_DUPLICATE', message: '이미 사용 중인 슬러그입니다.' });
      }
      if (err.message === 'INVALID_MEDIA_ID') {
        return res.status(400).json({ error: 'VALIDATION_ERROR', details: { coverMediaId: ['유효한 미디어 파일이 아닙니다.'] } });
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 쇼케이스 순서 재정렬
 * PUT /api/admin/showcase/reorder
 * 고정 주소를 파라미터형 라우트(:id)보다 상위에 등록합니다.
 */
router.put(
  '/admin/showcase/reorder',
  requireAuth,
  requireAdmin,
  validateBody(ReorderShowcaseItemsSchema),
  async (req: Request, res: Response) => {
    try {
      await showcaseService.reorderShowcaseItems(req.body.ids);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 쇼케이스 수정
 * PUT /api/admin/showcase/:id
 */
router.put(
  '/admin/showcase/:id',
  requireAuth,
  requireAdmin,
  validateBody(UpdateShowcaseItemSchema),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: '유효한 ID가 아닙니다.' });
      }

      const item = await showcaseService.updateShowcaseItem(id, req.body);
      res.json(item);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'NOT_FOUND', message: '해당 쇼케이스 작품을 찾을 수 없습니다.' });
      }
      if (err.message === 'SLUG_DUPLICATE') {
        return res.status(409).json({ error: 'SLUG_DUPLICATE', message: '이미 다른 작품에서 사용 중인 슬러그입니다.' });
      }
      if (err.message === 'INVALID_MEDIA_ID') {
        return res.status(400).json({ error: 'VALIDATION_ERROR', details: { coverMediaId: ['유효한 미디어 파일이 아닙니다.'] } });
      }
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 쇼케이스 단건 조회 (ID 기준)
 * GET /api/admin/showcase/:id
 */
router.get(
  '/admin/showcase/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: '유효한 ID가 아닙니다.' });
      }
      const item = await showcaseService.getShowcaseItemById(id);
      if (!item) {
        return res.status(404).json({ error: 'NOT_FOUND', message: '해당 쇼케이스 작품을 찾을 수 없습니다.' });
      }
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 쇼케이스 삭제
 * DELETE /api/admin/showcase/:id
 */
router.delete(
  '/admin/showcase/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: '유효한 ID가 아닙니다.' });
      }

      const existing = await showcaseService.getShowcaseItemById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: '해당 쇼케이스 작품을 찾을 수 없습니다.' });
      }

      await showcaseService.deleteShowcaseItem(id);
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

export default router;
