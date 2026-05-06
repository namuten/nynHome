import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as scheduleService from './schedule.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { month } = req.query as Record<string, string>;
  const schedules = await scheduleService.listSchedules(month);
  res.json(schedules);
});

router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    res.status(201).json(schedule);
  } catch {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const schedule = await scheduleService.updateSchedule(parseInt(req.params.id), req.body);
    res.json(schedule);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await scheduleService.deleteSchedule(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
