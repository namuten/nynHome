import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as layoutService from './layout.service';
import { UpdateLayoutSchema } from './layout.types';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const layout = await layoutService.getLayout();
  res.json(layout);
});

router.put('/', requireAuth, requireAdmin, validateBody(UpdateLayoutSchema), async (req: Request, res: Response) => {
  try {
    const layout = await layoutService.updateLayout(req.body);
    res.json(layout);
  } catch (err: any) {
    if (err.message === 'INVALID_POST_IDS') return res.status(400).json({ error: 'INVALID_POST_IDS' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
