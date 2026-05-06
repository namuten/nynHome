import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as postsService from './posts.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, page, limit } = req.query as Record<string, string>;
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

router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const post = await postsService.createPost(req.body);
  res.status(201).json(post);
});

router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
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
