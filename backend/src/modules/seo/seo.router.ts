import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateQuery, validateBody } from '../../lib/validation';
import * as seoService from './seo.service';
import { GetSeoQuerySchema, UpdateSeoBodySchema } from './seo.types';

const router = Router();

/**
 * public SEO / Open Graph 설정 조회
 * GET /api/seo?routeKey=portfolio&locale=ko
 */
router.get('/seo', validateQuery(GetSeoQuerySchema), async (req: Request, res: Response) => {
  try {
    const routeKey = req.query.routeKey as string;
    const locale = (req.query.locale as 'ko' | 'en') || 'ko';

    const settings = await seoService.getSeoSettings(routeKey, locale);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

/**
 * 어드민 SEO / Open Graph 설정 추가 및 수정
 * PUT /api/admin/seo/:routeKey
 */
router.put(
  '/admin/seo/:routeKey',
  requireAuth,
  requireAdmin,
  validateBody(UpdateSeoBodySchema),
  async (req: Request, res: Response) => {
    try {
      const { routeKey } = req.params;
      const settings = await seoService.updateSeoSettings(routeKey, req.body);
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

export default router;
