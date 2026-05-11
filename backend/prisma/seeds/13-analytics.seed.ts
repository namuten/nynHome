import { PrismaClient } from '@prisma/client';

// Post upload dates (days ago) that trigger traffic spikes
const SPIKE_DAYS = new Set([5, 8, 10, 18, 25, 30, 45, 50, 55, 60, 70, 72, 78, 85]);

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedAnalytics(prisma: PrismaClient): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 30);

  const endDay = new Date(today);
  endDay.setDate(endDay.getDate() - 1);

  // Clear previous sample data for this range
  await prisma.dailyAnalyticsRollup.deleteMany({
    where: { day: { gte: startDay, lte: endDay } },
  });

  const records = [];
  for (let i = 30; i >= 1; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const isSpike = SPIKE_DAYS.has(i);
    const weekend = isWeekend(day);

    const baseCount = isSpike ? rand(100, 150) : weekend ? rand(40, 80) : rand(15, 40);
    const baseSessions = isSpike ? rand(70, 110) : weekend ? rand(30, 60) : rand(10, 30);

    records.push(
      { day, route: '/', eventName: 'page_view', count: baseCount, uniqueSessions: baseSessions },
      { day, route: '/post', eventName: 'post_view', count: Math.floor(baseCount * 0.6), uniqueSessions: Math.floor(baseSessions * 0.6) },
      { day, route: '/guestbook', eventName: 'guestbook_visit', count: Math.floor(baseCount * 0.2), uniqueSessions: Math.floor(baseSessions * 0.2) }
    );
  }

  await prisma.dailyAnalyticsRollup.createMany({ data: records });
  console.log(`✅ analytics seeded (${records.length} records)`);
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedAnalytics(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
