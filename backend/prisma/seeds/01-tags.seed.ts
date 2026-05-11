import { PrismaClient } from '@prisma/client';

const TAGS = [
  { name: '그림', slug: 'geurim', color: '#6844c7' },
  { name: '디지털아트', slug: 'digital-art', color: '#7c3aed' },
  { name: '음악', slug: 'eumak', color: '#8b5cf6' },
  { name: '일상', slug: 'ilsang', color: '#a78bfa' },
  { name: '감성', slug: 'gamseong', color: '#9333ea' },
  { name: '독서기록', slug: 'dokseo-grok', color: '#7e22ce' },
  { name: '공부법', slug: 'gongbubob', color: '#6d28d9' },
  { name: '수학', slug: 'suhak', color: '#5b21b6' },
  { name: '영어', slug: 'yeongeo', color: '#4c1d95' },
  { name: '크로셰', slug: 'crochet-kr', color: '#a855f7' },
  { name: 'DIY', slug: 'diy', color: '#c084fc' },
  { name: '힐링', slug: 'healing', color: '#d8b4fe' },
  { name: 'Drawing', slug: 'drawing', color: '#7c3aed' },
  { name: 'Music', slug: 'music', color: '#8b5cf6' },
  { name: 'Study', slug: 'study', color: '#6d28d9' },
  { name: 'Creative', slug: 'creative', color: '#9333ea' },
  { name: 'Daily', slug: 'daily', color: '#a78bfa' },
  { name: 'Illustration', slug: 'illustration', color: '#7e22ce' },
  { name: 'Poetry', slug: 'poetry', color: '#6844c7' },
  { name: 'Film', slug: 'film', color: '#5b21b6' },
];

export async function seedTags(prisma: PrismaClient): Promise<void> {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log('✅ tags seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedTags(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
