import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as adminService from './admin.service';
import { UpdateMediaTypeSchema } from './admin.types';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/media-types', async (_req, res: Response) => {
  const types = await adminService.listMediaTypes();
  res.json(types);
});

router.put('/media-types/:id', validateBody(UpdateMediaTypeSchema), async (req: Request, res: Response) => {
  try {
    const type = await adminService.updateMediaType(parseInt(req.params.id), req.body);
    res.json(type);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await adminService.listUsers(
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20,
  );
  res.json(result);
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    if (err.message === 'CANNOT_DELETE_ADMIN') return res.status(403).json({ error: 'CANNOT_DELETE_ADMIN' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/dashboard', async (_req, res: Response) => {
  try {
    const summary = await adminService.getDashboardSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/comments', async (req: Request, res: Response) => {
  try {
    const { page, limit, postId, status, q } = req.query as Record<string, string>;
    const result = await adminService.listComments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      postId ? parseInt(postId) : undefined,
      (status as any) || 'all',
      q
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.patch('/comments/:id/hidden', async (req: Request, res: Response) => {
  try {
    const { isHidden } = req.body;
    if (typeof isHidden !== 'boolean') {
      return res.status(400).json({ error: 'VALIDATION_ERROR' });
    }
    const updated = await adminService.setCommentHidden(parseInt(req.params.id), isHidden);
    res.json(updated);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
