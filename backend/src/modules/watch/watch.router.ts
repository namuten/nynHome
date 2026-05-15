import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as watchService from './watch.service';
import { UpdateQuickRepliesSchema } from './watch.types';

const router = Router();

/**
 * @route   GET /api/watch/quick-replies
 * @desc    Get quick reply phrases for smartwatch
 * @access  Admin
 */
router.get('/quick-replies', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const replies = await watchService.getQuickReplies();
  res.json(replies);
});

/**
 * @route   PUT /api/watch/quick-replies
 * @desc    Update quick reply phrases
 * @access  Admin
 */
router.put('/quick-replies', requireAuth, requireAdmin, validateBody(UpdateQuickRepliesSchema), async (req: Request, res: Response) => {
  await watchService.updateQuickReplies(req.body);
  const updated = await watchService.getQuickReplies();
  res.json(updated);
});

export default router;
