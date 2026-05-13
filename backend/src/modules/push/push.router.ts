import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as pushService from './push.service';
import { SubscribeSchema, SendPushSchema, NativeTokenSchema } from './push.types';

const router = Router();

router.get('/vapid-public-key', async (_req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

router.post('/subscribe', requireAuth, validateBody(SubscribeSchema), async (req: Request, res: Response) => {
  const sub = await pushService.subscribe(req.body, req.user!.userId);
  res.status(201).json(sub);
});

router.post('/native-token', optionalAuth, validateBody(NativeTokenSchema), async (req: Request, res: Response) => {
  const result = await pushService.saveNativeToken(req.body.token, req.body.platform, req.user?.userId);
  res.status(201).json(result);
});

router.post('/send', requireAuth, requireAdmin, validateBody(SendPushSchema), async (req: Request, res: Response) => {
  const adminUserId = req.user!.userId;
  const dto = req.body;

  let sent: number;
  if (dto.targetType === 'user' && dto.targetUserId) {
    sent = await pushService.sendToUser(dto, dto.targetUserId, adminUserId);
  } else {
    sent = await pushService.sendToAll(dto, adminUserId);
  }
  res.json({ sent });
});

router.get('/history', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await pushService.getCampaignHistory(page, limit);
  res.json(result);
});

router.get('/stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const stats = await pushService.getCampaignStats();
  res.json(stats);
});

export default router;
