import { Router, Request, Response } from 'express';
import * as authService from './auth.service';

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

export default router;
