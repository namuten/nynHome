import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody, validateQuery } from '../../lib/validation';
import * as postsService from './posts.service';
import { CreatePostSchema, UpdatePostSchema, GetPostsQuerySchema } from './posts.types';

const router = Router();

router.get('/', validateQuery(GetPostsQuerySchema), async (req: Request, res: Response) => {
  const { category, page, limit } = req.query as any;
  const result = await postsService.listPosts({
    category: category as any,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json(result);
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await postsService.getPost(parseInt(req.params.id));
    res.json(post);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/', requireAuth, requireAdmin, validateBody(CreatePostSchema), async (req: Request, res: Response) => {
  try {
    const post = await postsService.createPost(req.body);
    res.status(201).json(post);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.put('/:id', requireAuth, requireAdmin, validateBody(UpdatePostSchema), async (req: Request, res: Response) => {
  try {
    const post = await postsService.updatePost(parseInt(req.params.id), req.body);
    res.json(post);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await postsService.deletePost(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
