import { Router, Request, Response } from 'express';
import * as authService from './auth.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'EMAIL_TAKEN' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/logout', (_req, res) => {
  // JWT는 stateless — 클라이언트가 토큰을 삭제하면 됨
  res.json({ message: 'LOGGED_OUT' });
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
  }
});

export default router;
