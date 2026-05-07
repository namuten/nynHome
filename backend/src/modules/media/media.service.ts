import { prisma } from '../../lib/prisma';
import { uploadToR2, deleteFromR2 } from '../../lib/r2';
import { FileCategory } from './media.types';
import { generateDerivatives } from './media.derivatives.service';

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

  const media = await prisma.media.create({
    data: {
      fileUrl,
      mimeType,
      fileCategory,
      fileName: originalName,
      fileSize,
      postId: postId ?? null,
    },
  });

  if (fileCategory === 'image') {
    // Run asynchronously in the background so it doesn't block the upload response
    generateDerivatives(media.id, buffer).catch((err) => {
      console.warn(`[DERIVATIVES] Background processing failed for media ID ${media.id}:`, err);
    });
  }

  return media;
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
  const media = await prisma.media.findUnique({
    where: { id },
    include: { derivatives: true },
  });
  if (!media) throw new Error('NOT_FOUND');

  // Delete derivatives from R2
  if (media.derivatives && media.derivatives.length > 0) {
    for (const d of media.derivatives) {
      try {
        await deleteFromR2(d.fileUrl);
      } catch (err) {
        console.warn(`[DERIVATIVES] Failed to delete derivative object ${d.fileUrl} from R2:`, err);
      }
    }
  }

  // Delete original from R2
  await deleteFromR2(media.fileUrl);

  // Cascade delete in MySQL DB
  await prisma.media.delete({ where: { id } });
}
