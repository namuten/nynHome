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
