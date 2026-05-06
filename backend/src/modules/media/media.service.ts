import { prisma } from '../../lib/prisma';
import { uploadToR2, deleteFromR2 } from '../../lib/r2';
import { FileCategory } from './media.types';

function resolveCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType.includes('presentation')) return 'document';
  return 'other';
}

export async function uploadMedia(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  fileSize: number,
  postId?: number,
) {
  const config = await prisma.mediaTypeConfig.findUnique({ where: { mimeType } });
  if (!config || !config.isAllowed) throw new Error('UNSUPPORTED_MEDIA_TYPE');
  if (fileSize > config.maxSizeMb * 1024 * 1024) throw new Error('FILE_TOO_LARGE');

  if (postId !== undefined) {
    if (postId <= 0 || !Number.isInteger(postId)) throw new Error('VALIDATION_ERROR');
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('POST_NOT_FOUND');
  }

  const fileUrl = await uploadToR2(buffer, mimeType, originalName);
  const fileCategory = resolveCategory(mimeType);

  return prisma.media.create({
    data: {
      fileUrl,
      mimeType,
      fileCategory,
      fileName: originalName,
      fileSize,
      postId: postId ?? null,
    },
  });
}

export async function listMedia(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.media.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.media.count(),
  ]);
  return { data, total, page, limit };
}

export async function deleteMedia(id: number) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error('NOT_FOUND');
  await deleteFromR2(media.fileUrl);
  await prisma.media.delete({ where: { id } });
}
