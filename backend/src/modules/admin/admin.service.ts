import { prisma } from '../../lib/prisma';
import { UpdateMediaTypeDto } from './admin.types';

export async function listMediaTypes() {
  return prisma.mediaTypeConfig.findMany({ orderBy: { fileCategory: 'asc' } });
}

export async function updateMediaType(id: number, dto: UpdateMediaTypeDto) {
  const config = await prisma.mediaTypeConfig.findUnique({ where: { id } });
  if (!config) throw new Error('NOT_FOUND');
  return prisma.mediaTypeConfig.update({ where: { id }, data: dto });
}

export async function listUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, nickname: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  return { data, total, page, limit };
}

export async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('NOT_FOUND');
  if (user.role === 'admin') throw new Error('CANNOT_DELETE_ADMIN');
  await prisma.user.delete({ where: { id } });
}

/**
 * 어드민 대시보드 지표 및 최근 활동 목록을 일괄적으로 조회합니다.
 * N+1 문제를 방지하기 위해 Promise.all 및 Prisma select 쿼리를 사용합니다.
 */
export async function getDashboardSummary() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    postsTotal,
    publishedPosts,
    draftPosts,
    mediaTotal,
    usersTotal,
    commentsTotal,
    hiddenComments,
    schedulesThisMonth,
    pushSubscriptions,
    recentPosts,
    recentMedia,
    rawRecentComments,
    recentUsers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { isPublished: true } }),
    prisma.post.count({ where: { isPublished: false } }),
    prisma.media.count(),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.comment.count({ where: { isHidden: true } }),
    prisma.schedule.count({
      where: {
        OR: [
          { startAt: { lte: endOfMonth }, endAt: { gte: startOfMonth } }
        ]
      }
    }),
    prisma.pushSubscription.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, isPublished: true, createdAt: true, updatedAt: true }
    }),
    prisma.media.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.comment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        post: { select: { title: true } },
        user: { select: { id: true, nickname: true, email: true } }
      }
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, nickname: true, role: true, createdAt: true }
    })
  ]);

  // Prisma의 BigInt 필드(Media.fileSize)는 JSON 직렬화 시 에러가 나므로 문자열로 변환해 줍니다.
  const serializedRecentMedia = recentMedia.map(m => ({
    ...m,
    fileSize: typeof m.fileSize === 'bigint' ? m.fileSize.toString() : Number(m.fileSize),
    createdAt: m.createdAt.toISOString()
  }));

  const recentComments = rawRecentComments.map(c => ({
    id: c.id,
    postId: c.postId,
    postTitle: c.post?.title || '',
    author: c.user ? { id: c.user.id, nickname: c.user.nickname, email: c.user.email } : null,
    body: c.body,
    reply: c.reply,
    isHidden: c.isHidden,
    createdAt: c.createdAt.toISOString()
  }));

  return {
    metrics: {
      postsTotal,
      publishedPosts,
      draftPosts,
      mediaTotal,
      usersTotal,
      commentsTotal,
      hiddenComments,
      schedulesThisMonth,
      pushSubscriptions
    },
    recentPosts: recentPosts.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    })),
    recentMedia: serializedRecentMedia,
    recentComments,
    recentUsers: recentUsers.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString()
    }))
  };
}

/**
 * 어드민용 전체 댓글 목록을 다양한 검색 조건과 함께 페이징 조회합니다.
 */
export async function listComments(
  page = 1,
  limit = 20,
  postId?: number,
  status: 'visible' | 'hidden' | 'all' = 'all',
  q?: string,
) {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (postId !== undefined && !isNaN(postId)) {
    where.postId = postId;
  }

  if (status === 'visible') {
    where.isHidden = false;
  } else if (status === 'hidden') {
    where.isHidden = true;
  }

  if (q && q.trim()) {
    where.OR = [
      { body: { contains: q } },
      { reply: { contains: q } }
    ];
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        post: { select: { title: true } },
        user: { select: { id: true, nickname: true, email: true } }
      }
    }),
    prisma.comment.count({ where })
  ]);

  const data = comments.map(c => ({
    id: c.id,
    postId: c.postId,
    postTitle: c.post?.title || '',
    author: c.user ? { id: c.user.id, nickname: c.user.nickname, email: c.user.email } : null,
    body: c.body,
    reply: c.reply,
    isHidden: c.isHidden,
    createdAt: c.createdAt.toISOString()
  }));

  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  };
}

/**
 * 특정 댓글의 숨김(isHidden) 여부를 수정합니다.
 */
export async function setCommentHidden(id: number, isHidden: boolean) {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new Error('NOT_FOUND');
  return prisma.comment.update({
    where: { id },
    data: { isHidden }
  });
}


