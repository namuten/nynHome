import type { MediaItem, MediaDerivative } from '../types/api';
import type { AdminMediaItem } from '../types/admin';

type GenericMedia = 
  | MediaItem 
  | AdminMediaItem 
  | { fileUrl?: string; url?: string; derivatives?: MediaDerivative[] };

/**
 * Resolves the best available image URL based on target derivative type.
 * Priority falls back to larger/smaller versions, then finally the original file url if derivatives are not found.
 */
export function getOptimizedImageUrl(
  media: GenericMedia | null | undefined,
  targetType: 'thumb_small' | 'thumb_medium' | 'web_optimized'
): string {
  if (!media) return '';

  const originalUrl = 
    ('fileUrl' in media ? media.fileUrl : 'url' in media ? media.url : '') || '';

  if (!media.derivatives || media.derivatives.length === 0) {
    return originalUrl;
  }

  // Define fallback search orders
  const priorityMap: Record<string, string[]> = {
    thumb_small: ['thumb_small', 'thumb_medium', 'web_optimized'],
    thumb_medium: ['thumb_medium', 'web_optimized', 'thumb_small'],
    web_optimized: ['web_optimized', 'thumb_medium', 'thumb_small'],
  };

  const checkOrder = priorityMap[targetType] || [targetType];

  for (const type of checkOrder) {
    const found = media.derivatives.find((d) => d.derivativeType === type);
    if (found) return found.fileUrl;
  }

  return originalUrl;
}
