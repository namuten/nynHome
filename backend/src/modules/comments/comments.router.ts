import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as commentsService from './comments.service';
import { CreateCommentSchema, ReplyCommentSchema } from './comments.types';
import { commentsRateLimiter, commentSpamGuard } from '../../middleware/rateLimit.middleware';

const router = Router();

// 이 라우터는 app.use('/api', commentsRouter) 형식으로 붙여 여러 경로를 처리함.

router.post('/posts/:postId/comments', requireAuth, commentsRateLimiter, commentSpamGuard, validateBody(CreateCommentSchema), async (req: Request, res: Response) => {
  try {
    const comment = await commentsService.createComment(
      parseInt(req.params.postId),
      req.user!.userId,
      req.body,
    );
    res.status(201).json(comment);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'POST_NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/posts/:postId/comments', async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await commentsService.listComments(
    parseInt(req.params.postId),
    page ? parseInt(page) : undefined,
    limit ? parseInt(limit) : undefined,
  );
  res.json(result);
});

router.put('/comments/:id/reply', requireAuth, requireAdmin, validateBody(ReplyCommentSchema), async (req: Request, res: Response) => {
  try {
    const comment = await commentsService.replyComment(parseInt(req.params.id), req.body);
    res.json(comment);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.delete('/comments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await commentsService.deleteComment(parseInt(req.params.id), req.user!.userId, req.user!.role);
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    if (err.message === 'FORBIDDEN') return res.status(403).json({ error: 'FORBIDDEN' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
