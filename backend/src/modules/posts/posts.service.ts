import { prisma } from '../../lib/prisma';
import { CreatePostDto, UpdatePostDto, ListPostsQuery } from './posts.types';

export async function listPosts(query: ListPostsQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, query.limit ?? 12);
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(query.category ? { category: query.category } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, thumbnailUrl: true, viewCount: true, createdAt: true },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getPost(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { media: true },
  });
  if (!post) throw new Error('NOT_FOUND');

  await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  return { ...post, viewCount: post.viewCount + 1 };
}

export async function createPost(dto: CreatePostDto) {
  return prisma.post.create({ data: dto });
}

export async function updatePost(id: number, dto: UpdatePostDto) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error('NOT_FOUND');
  return prisma.post.update({ where: { id }, data: dto });
}

export async function deletePost(id: number) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error('NOT_FOUND');
  await prisma.post.delete({ where: { id } });
}
