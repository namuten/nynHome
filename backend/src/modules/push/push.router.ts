import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
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

router.post('/native-token', requireAuth, validateBody(NativeTokenSchema), async (req: Request, res: Response) => {
  const result = await pushService.saveNativeToken(req.body.token, req.body.platform, req.user!.userId);
  res.status(201).json(result);
});

router.post('/send', requireAuth, requireAdmin, validateBody(SendPushSchema), async (req: Request, res: Response) => {
  const sent = await pushService.sendToAll(req.body);
  res.json({ sent });
});

export default router;
