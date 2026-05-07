import { createHash } from 'crypto';
import { prisma } from '../../lib/prisma';
import { CreateAnalyticsEventParams, AnalyticsQueryFilters } from './analytics.types';

export async function recordEvent(params: CreateAnalyticsEventParams) {
  const { eventName, route, referrer, locale, sessionId, userId, metadata } = params;

  if (!eventName || eventName.length > 120) {
    throw new Error('INVALID_EVENT_NAME');
  }

  // Basic check: route should start with '/' and be an internal path
  if (!route || !route.startsWith('/')) {
    throw new Error('INVALID_ROUTE');
  }

  const sessionIdHash = sessionId
    ? createHash('sha256').update(sessionId).digest('hex')
    : null;

  return await prisma.analyticsEvent.create({
    data: {
      eventName,
      route,
      referrer: referrer || null,
      locale: locale || null,
      userId: userId || null,
      sessionIdHash,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    },
  });
}

/**
 * High-performance analytics summary merging historical rollups with today's real-time raw events.
 */
export async function getAnalyticsSummary(filters: AnalyticsQueryFilters) {
  const start = filters.from ? new Date(filters.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = filters.to ? new Date(filters.to) : new Date();

  // 1. Fetch rollups
  const rollups = await prisma.dailyAnalyticsRollup.findMany({
    where: {
      day: { gte: start, lte: end },
    },
  });

  // 2. Fetch today's raw events (for up-to-the-minute real-time stats)
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayEvents = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: todayStart, lte: end },
    },
  });

  // Calculate totals
  let totalPageViews = rollups
    .filter((r) => r.eventName === 'page_view')
    .reduce((sum, r) => sum + r.count, 0);

  let totalUniqueSessions = rollups
    .filter((r) => r.eventName === 'page_view')
    .reduce((sum, r) => sum + r.uniqueSessions, 0);

  // Add today's raw counts
  const todayPageViews = todayEvents.filter((e) => e.eventName === 'page_view');
  totalPageViews += todayPageViews.length;

  const todaySessions = new Set(todayPageViews.map((e) => e.sessionIdHash).filter(Boolean));
  totalUniqueSessions += todaySessions.size;

  // Daily timeline charts data (last 30 days or filtered range)
  const timelineMap = new Map<string, { date: string; pageViews: number; sessions: number }>();

  // Initialize all dates in range with 0 to ensure beautiful continuous charts
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().split('T')[0];
    timelineMap.set(key, { date: key, pageViews: 0, sessions: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Populate timeline with rollup values
  rollups.forEach((r) => {
    const key = r.day.toISOString().split('T')[0];
    const existing = timelineMap.get(key);
    if (existing) {
      if (r.eventName === 'page_view') {
        existing.pageViews += r.count;
        existing.sessions += r.uniqueSessions;
      }
    }
  });

  // Populate timeline with today's real-time events
  const todayKey = todayStart.toISOString().split('T')[0];
  const todayTimeline = timelineMap.get(todayKey);
  if (todayTimeline) {
    todayTimeline.pageViews += todayPageViews.length;
    todayTimeline.sessions += todaySessions.size;
  }

  return {
    totalPageViews,
    totalUniqueSessions,
    avgViewsPerSession: totalUniqueSessions > 0 ? parseFloat((totalPageViews / totalUniqueSessions).toFixed(2)) : 0,
    timeline: Array.from(timelineMap.values()),
  };
}

/**
 * Breakdown of page views and unique sessions grouped by Route path.
 */
export async function getRouteAnalytics(filters: AnalyticsQueryFilters) {
  const start = filters.from ? new Date(filters.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = filters.to ? new Date(filters.to) : new Date();
  const limit = filters.limit || 15;

  // We can aggregate straight from raw AnalyticsEvent table for precision and flexible parameters
  const pageViews = await prisma.analyticsEvent.findMany({
    where: {
      eventName: 'page_view',
      createdAt: { gte: start, lte: end },
    },
    select: {
      route: true,
      sessionIdHash: true,
    },
  });

  const routeStatsMap = new Map<string, { route: string; pageViews: number; uniqueSessions: Set<string> }>();

  pageViews.forEach((pv) => {
    let stats = routeStatsMap.get(pv.route);
    if (!stats) {
      stats = { route: pv.route, pageViews: 0, uniqueSessions: new Set() };
      routeStatsMap.set(pv.route, stats);
    }
    stats.pageViews += 1;
    if (pv.sessionIdHash) {
      stats.uniqueSessions.add(pv.sessionIdHash);
    }
  });

  const formatted = Array.from(routeStatsMap.values())
    .map((s) => ({
      route: s.route,
      pageViews: s.pageViews,
      uniqueSessions: s.uniqueSessions.size,
    }))
    .sort((a, b) => b.pageViews - a.pageViews)
    .slice(0, limit);

  return formatted;
}

/**
 * Fetch logs of custom event categories (e.g., CTA clicks, resume downloads).
 */
export async function getEventsAnalytics(filters: AnalyticsQueryFilters) {
  const start = filters.from ? new Date(filters.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = filters.to ? new Date(filters.to) : new Date();

  const where: any = {
    createdAt: { gte: start, lte: end },
  };
  if (filters.eventName) {
    where.eventName = filters.eventName;
  }

  const events = await prisma.analyticsEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return events;
}
