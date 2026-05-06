import { prisma } from '../../lib/prisma';
import { CreateCommentDto, ReplyCommentDto } from './comments.types';

export async function createComment(postId: number, userId: number, dto: CreateCommentDto) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('NOT_FOUND');

  return prisma.comment.create({
    data: { body: dto.body, postId, userId },
    include: { user: { select: { nickname: true, avatarUrl: true } } },
  });
}

export async function listComments(postId: number, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  const where = { postId };

  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { nickname: true, avatarUrl: true } } },
    }),
    prisma.comment.count({ where }),
  ]);

  // 숨김 처리된 댓글 필터링
  const sanitized = data.map((c) =>
    c.isHidden ? { ...c, body: '삭제된 댓글입니다.', reply: null } : c,
  );

  return { data: sanitized, total, page, limit };
}

export async function replyComment(commentId: number, dto: ReplyCommentDto) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('NOT_FOUND');
  return prisma.comment.update({
    where: { id: commentId },
    data: { reply: dto.reply },
  });
}

export async function deleteComment(commentId: number, userId: number, role: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('NOT_FOUND');

  if (role !== 'admin' && comment.userId !== userId) {
    throw new Error('FORBIDDEN');
  }

  // 물리 삭제 대신 숨김 처리 (대댓글 등 구조 보존)
  await prisma.comment.update({
    where: { id: commentId },
    data: { isHidden: true },
  });
}

export async function listAllComments(page = 1, limit = 50) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { nickname: true, avatarUrl: true } },
        post: { select: { id: true, title: true } },
      },
    }),
    prisma.comment.count(),
  ]);

  return { data, total, page, limit };
}

export async function toggleCommentHide(commentId: number, isHidden: boolean) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('NOT_FOUND');

  return prisma.comment.update({
    where: { id: commentId },
    data: { isHidden },
  });
}


