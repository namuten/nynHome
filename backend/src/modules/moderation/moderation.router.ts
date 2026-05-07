import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../lib/validation';
import {
  ReportListQuerySchema,
  UpdateReportStatusSchema,
  ModerationQueueQuerySchema,
  ModerateCommentSchema,
} from './moderation.types';
import * as moderationService from './moderation.service';

const router = Router();

// Apply auth middleware to all admin routes
router.use(requireAuth, requireAdmin);

router.get('/reports', validateQuery(ReportListQuerySchema), async (req: Request, res: Response) => {
  try {
    const result = await moderationService.listReports(req.query as any);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.patch('/reports/:type/:id/status', validateBody(UpdateReportStatusSchema), async (req: Request, res: Response) => {
  try {
    const result = await moderationService.updateReportStatus(
      req.params.type,
      parseInt(req.params.id),
      req.body,
      req.user!.userId,
      req
    );
    res.json(result);
  } catch (err: any) {
    if (err.message === 'UNSUPPORTED_TYPE') return res.status(400).json({ error: 'VALIDATION_ERROR' });
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/moderation/queue', validateQuery(ModerationQueueQuerySchema), async (req: Request, res: Response) => {
  try {
    const queue = await moderationService.getModerationQueue(req.query as any);
    res.json(queue);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.patch('/comments/:id/moderation', validateBody(ModerateCommentSchema), async (req: Request, res: Response) => {
  try {
    const result = await moderationService.moderateComment(
      parseInt(req.params.id),
      req.body,
      req.user!.userId,
      req
    );
    res.json(result);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
