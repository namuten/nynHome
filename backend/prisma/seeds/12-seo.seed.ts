import { PrismaClient } from '@prisma/client';

const SEO = [
  {
    routeKey: 'home', locale: 'ko',
    title: '나연의 크리에이티브 공간 — CrocHub',
    description: '그림, 음악, 글로 채우는 나연의 개인 홈페이지',
    keywords: ['디지털아트', '일러스트', '음악', '크로셰', '나연'],
  },
  {
    routeKey: 'home', locale: 'en',
    title: "Nayeon's Creative Space — CrocHub",
    description: 'A personal homepage filled with art, music & words',
    keywords: ['digital art', 'illustration', 'music', 'crochet', 'Nayeon'],
  },
  {
    routeKey: 'portfolio', locale: 'ko',
    title: '포트폴리오 — 나연',
    description: '나연의 작품과 프로젝트 모음',
    keywords: ['포트폴리오', '일러스트', '크로셰', '음악 커버'],
  },
  {
    routeKey: 'portfolio', locale: 'en',
    title: 'Portfolio — Nayeon',
    description: "A collection of Nayeon's works and projects",
    keywords: ['portfolio', 'illustration', 'crochet', 'music cover'],
  },
  {
    routeKey: 'blog', locale: 'ko',
    title: '블로그 — 나연의 일상과 생각',
    description: '일상, 감성, 책, 음악 이야기',
    keywords: ['블로그', '일상', '독서', '음악', '감성'],
  },
  {
    routeKey: 'blog', locale: 'en',
    title: "Blog — Nayeon's daily life & thoughts",
    description: 'Daily life, music, books, and more',
    keywords: ['blog', 'daily', 'reading', 'music'],
  },
  {
    routeKey: 'study', locale: 'ko',
    title: '공부 기록 — 나연',
    description: '수학, 영어, 공부 루틴 공유',
    keywords: ['공부', '수학', '영어', '공부법', '고등학생'],
  },
  {
    routeKey: 'study', locale: 'en',
    title: 'Study Notes — Nayeon',
    description: 'Math, English, and study tips',
    keywords: ['study', 'math', 'english', 'high school'],
  },
];

export async function seedSeo(prisma: PrismaClient): Promise<void> {
  for (const s of SEO) {
    await prisma.seoSettings.upsert({
      where: { routeKey_locale: { routeKey: s.routeKey, locale: s.locale } },
      update: {},
      create: s,
    });
  }
  console.log('✅ SEO settings seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedSeo(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
