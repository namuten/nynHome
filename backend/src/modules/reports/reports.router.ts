import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import { CreateCommentReportSchema } from './reports.types';
import * as reportsService from './reports.service';
import { commentsRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// Endpoint for users to report a comment
router.post('/comments/:id/reports', requireAuth, commentsRateLimiter, validateBody(CreateCommentReportSchema), async (req: Request, res: Response) => {
  try {
    const report = await reportsService.createCommentReport(
      parseInt(req.params.id),
      req.user!.userId,
      req.body
    );
    res.status(201).json(report);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'COMMENT_NOT_FOUND' });
    }
    if (err.message === 'ALREADY_REPORTED') {
      return res.status(409).json({ error: 'ALREADY_REPORTED' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
