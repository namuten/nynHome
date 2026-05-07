import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../lib/validation';
import * as portfolioService from './portfolio.service';
import {
  CreatePortfolioSectionSchema,
  UpdatePortfolioSectionSchema,
  ReorderSectionsSchema,
  GetPortfolioQuerySchema,
} from './portfolio.types';

const router = Router();

/**
 * public 포트폴리오 섹션 목록 조회
 * GET /api/portfolio?locale=ko
 */
router.get('/portfolio', validateQuery(GetPortfolioQuerySchema), async (req: Request, res: Response) => {
  try {
    const locale = (req.query.locale as 'ko' | 'en') || 'ko';
    const sections = await portfolioService.getPortfolioSections(locale);
    res.json({ locale, sections });
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

/**
 * 어드민 포트폴리오 섹션 신규 추가
 * POST /api/admin/portfolio/sections
 */
router.post(
  '/admin/portfolio/sections',
  requireAuth,
  requireAdmin,
  validateBody(CreatePortfolioSectionSchema),
  async (req: Request, res: Response) => {
    try {
      const section = await portfolioService.createPortfolioSection(req.body);
      res.status(201).json(section);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 포트폴리오 섹션 순서 재정렬
 * PUT /api/admin/portfolio/sections/reorder
 */
router.put(
  '/admin/portfolio/sections/reorder',
  requireAuth,
  requireAdmin,
  validateBody(ReorderSectionsSchema),
  async (req: Request, res: Response) => {
    try {
      await portfolioService.reorderPortfolioSections(req.body.ids);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 포트폴리오 섹션 수정
 * PUT /api/admin/portfolio/sections/:id
 */
router.put(
  '/admin/portfolio/sections/:id',
  requireAuth,
  requireAdmin,
  validateBody(UpdatePortfolioSectionSchema),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: '유효한 ID가 아닙니다.' });
      }

      const existing = await portfolioService.getPortfolioSectionById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: '해당 섹션을 찾을 수 없습니다.' });
      }

      const section = await portfolioService.updatePortfolioSection(id, req.body);
      res.json(section);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

/**
 * 어드민 포트폴리오 섹션 삭제
 * DELETE /api/admin/portfolio/sections/:id
 */
router.delete(
  '/admin/portfolio/sections/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: '유효한 ID가 아닙니다.' });
      }

      const existing = await portfolioService.getPortfolioSectionById(id);
      if (!existing) {
        return res.status(404).json({ error: 'NOT_FOUND', message: '해당 섹션을 찾을 수 없습니다.' });
      }

      await portfolioService.deletePortfolioSection(id);
      res.status(204).end();
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

export default router;
