import sharp from 'sharp';
import { prisma } from '../../lib/prisma';
import { r2, R2_BUCKET, R2_PUBLIC_URL } from '../../lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Internally streams a resized image buffer directly to R2 bucket.
 */
async function uploadDerivativeToR2(
  buffer: Buffer,
  mediaId: number,
  derivativeType: string,
): Promise<string> {
  const key = `derivatives/${mediaId}/${derivativeType}.webp`;
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
    }),
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Generates and uploads small, medium, and optimized derivatives for a media image.
 */
export async function generateDerivatives(mediaId: number, buffer: Buffer): Promise<void> {
  try {
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media || media.fileCategory !== 'image') return;

    console.log(`[DERIVATIVES] Generating derivatives for media ID ${mediaId}...`);

    const image = sharp(buffer);
    const metadata = await image.metadata();
    const origWidth = metadata.width || 800;

    const targets = [
      { type: 'thumb_small', width: 320, quality: 80 },
      { type: 'thumb_medium', width: 768, quality: 80 },
      { type: 'web_optimized', width: 1600, quality: 85 },
    ];

    for (const target of targets) {
      const targetWidth = Math.min(origWidth, target.width);

      const derivativeBuffer = await image
        .clone()
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: target.quality })
        .toBuffer();

      const derivativeInfo = await sharp(derivativeBuffer).metadata();
      const fileUrl = await uploadDerivativeToR2(derivativeBuffer, mediaId, target.type);

      await prisma.mediaDerivative.upsert({
        where: {
          mediaId_derivativeType: {
            mediaId,
            derivativeType: target.type,
          },
        },
        update: {
          fileUrl,
          width: derivativeInfo.width || null,
          height: derivativeInfo.height || null,
          mimeType: 'image/webp',
          fileSize: BigInt(derivativeBuffer.length),
        },
        create: {
          mediaId,
          derivativeType: target.type,
          fileUrl,
          width: derivativeInfo.width || null,
          height: derivativeInfo.height || null,
          mimeType: 'image/webp',
          fileSize: BigInt(derivativeBuffer.length),
        },
      });
    }

    console.log(`[DERIVATIVES] Finished generating derivatives for media ID ${mediaId}.`);
  } catch (err) {
    console.warn(`[DERIVATIVES] Failed to generate derivatives for media ID ${mediaId}:`, err);
  }
}

/**
 * Downloads the original file from R2 and runs the derivatives generation pipeline.
 */
export async function regenerateDerivatives(mediaId: number): Promise<void> {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new Error('MEDIA_NOT_FOUND');
  if (media.fileCategory !== 'image') throw new Error('NOT_AN_IMAGE');

  console.log(`[DERIVATIVES] Fetching original image for regeneration from ${media.fileUrl}...`);

  const response = await fetch(media.fileUrl);
  if (!response.ok) throw new Error(`FAILED_TO_DOWNLOAD_ORIGINAL (Status: ${response.status})`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await generateDerivatives(mediaId, buffer);
}
