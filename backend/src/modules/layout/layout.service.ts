import { prisma } from '../../lib/prisma';
import { UpdateLayoutDto } from './layout.types';

export async function getLayout() {
  return prisma.contentLayout.findMany({ orderBy: { order: 'asc' } });
}

export async function updateLayout(sections: UpdateLayoutDto) {
  await prisma.contentLayout.deleteMany();
  return prisma.$transaction(
    sections.map((s, i) =>
      prisma.contentLayout.create({
        data: { sectionKey: s.sectionKey, postIds: s.postIds, order: i, isVisible: s.isVisible },
      }),
    ),
  );
}
