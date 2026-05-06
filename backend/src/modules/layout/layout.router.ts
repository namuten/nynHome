import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as layoutService from './layout.service';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const layout = await layoutService.getLayout();
  res.json(layout);
});

router.put('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const layout = await layoutService.updateLayout(req.body);
  res.json(layout);
});

export default router;
