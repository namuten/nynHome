import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as auditService from './audit.service';

const router = Router();

router.get('/audit-logs', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { page, limit, action, resourceType } = req.query as Record<string, string>;
  try {
    const result = await auditService.listAuditLogs({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      action,
      resourceType,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
