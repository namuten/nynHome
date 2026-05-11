import { PrismaClient } from '@prisma/client';

export async function seedCollections(prisma: PrismaClient): Promise<void> {
  // 봄 감성 모음 — creative posts
  const springColl = await getOrCreateCollection(prisma, {
    title: '봄 감성 모음 🌸',
    description: '봄 테마의 창작 콘텐츠 모음',
    isPublished: true,
  });
  const creativePosts = await prisma.post.findMany({
    where: { category: 'creative', isPublished: true },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });
  for (let i = 0; i < creativePosts.length; i++) {
    await upsertCollectionItem(prisma, springColl.id, 'post', creativePosts[i].id, i);
  }

  // 공부 기록 아카이브 — study posts
  const studyColl = await getOrCreateCollection(prisma, {
    title: '공부 기록 아카이브 📚',
    description: '수학, 영어, 공부법 게시글 모음',
    isPublished: true,
  });
  const studyPosts = await prisma.post.findMany({
    where: { category: 'study', isPublished: true },
    orderBy: { createdAt: 'asc' },
  });
  for (let i = 0; i < studyPosts.length; i++) {
    await upsertCollectionItem(prisma, studyColl.id, 'post', studyPosts[i].id, i);
  }

  // 음악·감성 플레이리스트 — blog posts
  const musicColl = await getOrCreateCollection(prisma, {
    title: '음악·감성 플레이리스트 🎵',
    description: '음악과 감성이 담긴 블로그 게시글',
    isPublished: true,
  });
  const blogPosts = await prisma.post.findMany({
    where: { category: 'blog', isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 3,
  });
  for (let i = 0; i < blogPosts.length; i++) {
    await upsertCollectionItem(prisma, musicColl.id, 'post', blogPosts[i].id, i);
  }

  // 작품 포트폴리오 — showcase items (contentType: 'portfolio_item')
  const portfolioColl = await getOrCreateCollection(prisma, {
    title: '작품 포트폴리오 ✨',
    description: '나연의 대표 창작 작품들',
    isPublished: true,
  });
  const showcaseItems = await prisma.showcaseItem.findMany({
    where: { isFeatured: true, isPublished: true },
    orderBy: { order: 'asc' },
  });
  for (let i = 0; i < showcaseItems.length; i++) {
    await upsertCollectionItem(prisma, portfolioColl.id, 'portfolio_item', showcaseItems[i].id, i);
  }

  console.log('✅ collections seeded');
}

async function getOrCreateCollection(
  prisma: PrismaClient,
  data: { title: string; description: string; isPublished: boolean }
) {
  const existing = await prisma.collection.findFirst({ where: { title: data.title } });
  if (existing) return existing;
  return prisma.collection.create({ data });
}

async function upsertCollectionItem(
  prisma: PrismaClient,
  collectionId: number,
  contentType: string,
  contentId: number,
  position: number
) {
  await prisma.collectionItem.upsert({
    where: { collectionId_contentType_contentId: { collectionId, contentType, contentId } },
    update: { position },
    create: { collectionId, contentType, contentId, position },
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedCollections(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
