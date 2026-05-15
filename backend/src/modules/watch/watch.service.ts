import { prisma } from '../../lib/prisma';
import { UpdateQuickRepliesDto } from './watch.types';

export async function getQuickReplies() {
  return prisma.watchQuickReply.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function updateQuickReplies(dto: UpdateQuickRepliesDto) {
  return prisma.$transaction(async (tx) => {
    // Delete existing and recreate to simplify sync
    await tx.watchQuickReply.deleteMany();
    return tx.watchQuickReply.createMany({
      data: dto.replies.map((r, i) => ({
        body: r.body,
        sortOrder: r.sortOrder ?? i,
      })),
    });
  });
}
