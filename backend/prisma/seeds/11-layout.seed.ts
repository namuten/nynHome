import { PrismaClient } from '@prisma/client';

export async function seedLayout(prisma: PrismaClient): Promise<void> {
  // featured: top 3 most-viewed posts
  const featured = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 3,
  });

  // recent_creative: latest 4 creative posts
  const recentCreative = await prisma.post.findMany({
    where: { category: 'creative', isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  // recent_blog: latest 3 blog posts
  const recentBlog = await prisma.post.findMany({
    where: { category: 'blog', isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const sections = [
    { sectionKey: 'featured', postIds: featured.map((p) => p.id), order: 0 },
    { sectionKey: 'recent_creative', postIds: recentCreative.map((p) => p.id), order: 1 },
    { sectionKey: 'recent_blog', postIds: recentBlog.map((p) => p.id), order: 2 },
  ];

  for (const s of sections) {
    await prisma.contentLayout.deleteMany({ where: { sectionKey: s.sectionKey } });
    await prisma.contentLayout.create({
      data: {
        sectionKey: s.sectionKey,
        postIds: s.postIds,
        order: s.order,
        isVisible: true,
      },
    });
  }

  console.log('✅ content layout seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedLayout(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
