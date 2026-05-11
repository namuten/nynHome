import { PrismaClient } from '@prisma/client';

function offset(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function offsetEnd(days: number, hours = 2): Date {
  const d = offset(days);
  d.setHours(hours, 0, 0, 0);
  return d;
}

const SCHEDULES = [
  { title: '기말고사', startAt: offset(-60), endAt: offsetEnd(-58, 18), color: '#ef4444' },
  { title: '미술 동아리 전시회', startAt: offset(-45), endAt: offsetEnd(-44, 17), color: '#8b5cf6' },
  { title: '봄 일러스트 완성 마감', startAt: offset(-30), endAt: offsetEnd(-30, 23), color: '#6844c7' },
  { title: '독서 클럽 모임', startAt: offset(-14), endAt: offsetEnd(-14, 16), color: '#10b981' },
  { title: '피아노 연습', startAt: offset(-1), endAt: offsetEnd(-1, 19), color: '#f59e0b' },
  { title: '블로그 포스팅 마감', startAt: offset(0), endAt: offsetEnd(0, 23), color: '#6844c7' },
  { title: '친구 생일 파티 🎉', startAt: offset(5), endAt: offsetEnd(5, 21), color: '#ec4899' },
  { title: '수행평가 제출', startAt: offset(10), endAt: offsetEnd(10, 17), color: '#ef4444' },
  { title: '크로셰 작품 촬영', startAt: offset(14), endAt: offsetEnd(14, 16), color: '#8b5cf6' },
  { title: '여름 일러스트 기획', startAt: offset(21), endAt: offsetEnd(21, 20), color: '#6844c7' },
  { title: '음악 커버 녹음', startAt: offset(28), endAt: offsetEnd(28, 18), color: '#f59e0b' },
  { title: '방학 시작 🏖️', startAt: offset(45), endAt: offsetEnd(46, 23), color: '#10b981' },
];

export async function seedSchedules(prisma: PrismaClient): Promise<void> {
  for (const s of SCHEDULES) {
    const existing = await prisma.schedule.findFirst({ where: { title: s.title } });
    if (existing) continue;
    await prisma.schedule.create({ data: s });
  }
  console.log('✅ schedules seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedSchedules(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
