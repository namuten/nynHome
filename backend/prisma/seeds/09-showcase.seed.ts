import { PrismaClient } from '@prisma/client';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const ITEMS = [
  {
    title: 'Spring Illustration Series',
    slug: 'spring-illust-2026',
    description: '2026년 봄 테마로 작업한 디지털 일러스트 시리즈. 벚꽃, 고양이, 봄비 등 계절 감성을 담았어요.',
    category: 'Digital Art',
    locale: 'ko',
    tags: ['geurim', 'digital-art', 'illustration'],
    isFeatured: true,
    isPublished: true,
    publishedAt: daysAgo(45),
    order: 0,
  },
  {
    title: 'Rainy Days — Piano Covers EP',
    slug: 'rainy-days-ep',
    description: '빗소리와 어울리는 피아노 커버 6곡 모음. IU, 뉴진스, 아이유 원곡을 나만의 감성으로 편곡했어요.',
    category: 'Music',
    locale: 'ko',
    tags: ['eumak', 'music', 'gamseong'],
    isFeatured: true,
    isPublished: true,
    publishedAt: daysAgo(30),
    order: 1,
  },
  {
    title: '크로셰 인형 컬렉션 Vol.1',
    slug: 'crochet-collection-vol1',
    description: '손으로 직접 만든 뜨개 인형 4종 — 곰돌이, 토끼, 고양이, 강아지. 각자 도안 개발 과정 포함.',
    category: 'DIY & Craft',
    locale: 'ko',
    tags: ['crochet-kr', 'diy', 'creative'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(20),
    order: 2,
  },
  {
    title: '일러스트 캐릭터 제작기',
    slug: 'character-design-process',
    description: '나만의 캐릭터 "크로미"를 디자인하는 과정을 담은 작업 노트. 컬러 팔레트 선정부터 최종 완성까지.',
    category: 'Digital Art',
    locale: 'ko',
    tags: ['geurim', 'illustration', 'creative'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(15),
    order: 3,
  },
  {
    title: '내가 쓴 시 모음',
    slug: 'poetry-collection',
    description: '일상에서 느낀 감정을 짧은 시로 담아낸 컬렉션. 봄, 비, 음악, 그리움을 주제로 10편을 모았어요.',
    category: 'Writing',
    locale: 'ko',
    tags: ['poetry', 'gamseong', 'ilsang'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(10),
    order: 4,
  },
  {
    title: 'CrocHub — 개인 홈페이지 개발',
    slug: 'crochub-web',
    description: 'React + Node.js + MySQL로 제작한 개인 홈페이지 프로젝트. 포트폴리오, 블로그, 미디어 라이브러리를 통합한 풀스택 웹 앱.',
    category: 'Full-Stack Web',
    locale: 'ko',
    tags: ['creative'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(5),
    order: 5,
  },
];

export async function seedShowcase(prisma: PrismaClient): Promise<void> {
  for (const item of ITEMS) {
    await prisma.showcaseItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('✅ showcase items seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedShowcase(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
