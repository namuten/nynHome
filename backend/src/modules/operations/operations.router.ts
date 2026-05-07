import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { operationsService } from './operations.service';

const router = Router();

// Secure all endpoints under admin operations with strict authentication & admin authorization
router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/backup-runs
 * Retrieve a paginated list of automated/manual backup runs
 */
router.get('/backup-runs', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const result = await operationsService.getBackupRuns(page, limit);
    res.json(result);
  } catch (err: any) {
    console.error('Failed fetching backup runs:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/admin/backup-runs/db
 * Manually trigger an asynchronous database dump execution
 */
router.post('/backup-runs/db', async (_req: Request, res: Response) => {
  try {
    const run = await operationsService.triggerBackupRun();
    res.status(202).json(run); // 202 Accepted representing background execution
  } catch (err: any) {
    console.error('Failed triggering database backup:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

/**
 * GET /api/admin/system/health
 * Fetch detailed metrics and health telemetry of core services
 */
router.get('/system/health', async (_req: Request, res: Response) => {
  try {
    const stats = await operationsService.getSystemHealth();
    res.json(stats);
  } catch (err: any) {
    console.error('Failed fetching health statistics:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
