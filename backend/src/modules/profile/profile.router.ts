import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../lib/validation';
import * as profileService from './profile.service';
import { GetProfileQuerySchema, UpdateProfileSchema } from './profile.types';

const router = Router();

/**
 * public 프로필 조회
 * GET /api/profile?locale=ko
 */
router.get('/profile', validateQuery(GetProfileQuerySchema), async (req: Request, res: Response) => {
  try {
    const locale = (req.query.locale as 'ko' | 'en') || 'ko';
    const profile = await profileService.getProfile(locale);
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

/**
 * 어드민 프로필 수정
 * PUT /api/admin/profile/:locale
 */
router.put(
  '/admin/profile/:locale',
  requireAuth,
  requireAdmin,
  validateBody(UpdateProfileSchema),
  async (req: Request, res: Response) => {
    try {
      const locale = req.params.locale as any;
      if (locale !== 'ko' && locale !== 'en') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: '지원하지 않는 언어 코드입니다. ko 또는 en만 허용됩니다.',
        });
      }

      const profile = await profileService.updateProfile(locale, req.body);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
);

export default router;
