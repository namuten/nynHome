import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as adminService from './admin.service';
import * as pushService from '../push/push.service';
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

/**
 * GET /api/admin/media-types
 * 미디어 업로드 허용 확장자 및 최대 크기 설정 목록 조회
 */
router.get('/media-types', async (_req, res: Response) => {
  try {
    const list = await adminService.listMediaTypes();
    res.json(list);
  } catch {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/**
 * PUT /api/admin/media-types/:id
 * 특정 미디어 업로드 확장자 속성(허용 여부, 최대 크기) 편집
 */
router.put('/media-types/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { isAllowed, maxSizeMb } = req.body;
    if (typeof isAllowed !== 'boolean' || typeof maxSizeMb !== 'number') {
      return res.status(400).json({ error: 'VALIDATION_ERROR' });
    }
    const updated = await adminService.updateMediaType(id, { isAllowed, maxSizeMb });
    res.json(updated);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/admin/push/send
 * 전체 PWA 구독자 대상 관리자 긴급 푸시 알림 일괄 발송
 */
router.post('/push/send', async (req: Request, res: Response) => {
  try {
    const { title, body, url } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'VALIDATION_ERROR' });
    }
    const sentCount = await pushService.sendToAll({ title, body, url });
    res.json({ success: true, sentCount });
  } catch (err: any) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
