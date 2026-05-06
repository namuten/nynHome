import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as adminService from './admin.service';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/media-types', async (_req, res: Response) => {
  const types = await adminService.listMediaTypes();
  res.json(types);
});

router.put('/media-types/:id', async (req: Request, res: Response) => {
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

export default router;
