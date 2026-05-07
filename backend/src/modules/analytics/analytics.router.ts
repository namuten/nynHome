import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as analyticsService from './analytics.service';

const router = Router();

// 1. Public Event Ingestion Endpoint (Anonymous allowed)
router.post('/analytics/events', async (req: Request, res: Response) => {
  const { eventName, route, referrer, locale, sessionId, metadata } = req.body;
  try {
    const event = await analyticsService.recordEvent({
      eventName,
      route,
      referrer,
      locale,
      sessionId,
      metadata,
      userId: req.user?.userId, // populated if user is logged in
    });
    res.status(201).json({ status: 'ACCEPTED', eventId: event.id.toString() });
  } catch (err: any) {
    if (err.message === 'INVALID_EVENT_NAME' || err.message === 'INVALID_ROUTE') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  }
});

// 2. Admin Analytics Summary Endpoint
router.get('/admin/analytics/summary', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { from, to } = req.query as Record<string, string>;
  try {
    const summary = await analyticsService.getAnalyticsSummary({ from, to });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// 3. Admin Routes Stats Breakdown
router.get('/admin/analytics/routes', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { from, to, limit } = req.query as Record<string, string>;
  try {
    const stats = await analyticsService.getRouteAnalytics({
      from,
      to,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// 4. Admin Raw Event Fetching
router.get('/admin/analytics/events', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { from, to, eventName } = req.query as Record<string, string>;
  try {
    const events = await analyticsService.getEventsAnalytics({ from, to, eventName });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
