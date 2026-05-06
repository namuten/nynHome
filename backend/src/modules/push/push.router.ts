import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as pushService from './push.service';

const router = Router();

router.post('/subscribe', requireAuth, async (req: Request, res: Response) => {
  const sub = await pushService.subscribe(req.body, req.user!.userId);
  res.status(201).json(sub);
});

router.post('/send', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const sent = await pushService.sendToAll(req.body);
  res.json({ sent });
});

export default router;
