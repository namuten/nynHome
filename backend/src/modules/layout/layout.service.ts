import { prisma } from '../../lib/prisma';
import { UpdateLayoutDto } from './layout.types';

export async function getLayout() {
  return prisma.contentLayout.findMany({ orderBy: { order: 'asc' } });
}

export async function updateLayout(sections: UpdateLayoutDto) {
  const allPostIds = Array.from(new Set(sections.flatMap(s => s.postIds)));
  if (allPostIds.length > 0) {
    const postCount = await prisma.post.count({ where: { id: { in: allPostIds } } });
    if (postCount !== allPostIds.length) {
      throw new Error('INVALID_POST_IDS');
    }
  }

  return prisma.$transaction(async tx => {
    await tx.contentLayout.deleteMany();
    const results = [];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      const created = await tx.contentLayout.create({
        data: { sectionKey: s.sectionKey, postIds: s.postIds, order: i, isVisible: s.isVisible },
      });
      results.push(created);
    }
    return results;
  });
}
