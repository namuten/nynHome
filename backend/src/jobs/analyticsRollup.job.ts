import { prisma } from '../lib/prisma';

export async function runRollup() {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(yesterday);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const dayStr = yesterday.toISOString().split('T')[0];
  console.log(`[ROLLUP] Starting analytics rollup for day: ${dayStr}`);

  // Fetch all events from yesterday
  const events = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: yesterday,
        lte: dayEnd,
      },
    },
    select: {
      route: true,
      eventName: true,
      sessionIdHash: true,
    },
  });

  // Group by route + eventName
  const groups = new Map<string, { route: string; eventName: string; count: number; sessions: Set<string> }>();

  events.forEach((e) => {
    const key = `${e.route}:${e.eventName}`;
    let grp = groups.get(key);
    if (!grp) {
      grp = { route: e.route, eventName: e.eventName, count: 0, sessions: new Set() };
      groups.set(key, grp);
    }
    grp.count += 1;
    if (e.sessionIdHash) {
      grp.sessions.add(e.sessionIdHash);
    }
  });

  // Upsert into DailyAnalyticsRollup
  for (const [_, grp] of groups) {
    const existing = await prisma.dailyAnalyticsRollup.findFirst({
      where: {
        day: yesterday,
        route: grp.route,
        eventName: grp.eventName,
      },
    });

    if (existing) {
      await prisma.dailyAnalyticsRollup.update({
        where: { id: existing.id },
        data: {
          count: grp.count,
          uniqueSessions: grp.sessions.size,
        },
      });
    } else {
      await prisma.dailyAnalyticsRollup.create({
        data: {
          day: yesterday,
          route: grp.route,
          eventName: grp.eventName,
          count: grp.count,
          uniqueSessions: grp.sessions.size,
        },
      });
    }
  }

  console.log(`[ROLLUP] Analytics rollup finished successfully. Processed ${groups.size} aggregate route groups.`);
}

// If run directly from terminal
if (require.main === module) {
  runRollup()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error('[ROLLUP] Failed:', err);
      process.exit(1);
    });
}
