import { z } from 'zod';

/**
 * ShowcaseItem Zod 유효성 검증 규칙 정의
 */

// 슬러그 패턴 (알파벳 소문자, 숫자, 대시 - 허용)
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CreateShowcaseItemSchema = z.object({
  title: z.string().min(1, '제목은 최소 1자 이상이어야 합니다.').max(200, '제목은 최대 200자까지 허용됩니다.'),
  slug: z
    .string()
    .min(1, '슬러그는 최소 1자 이상이어야 합니다.')
    .max(100, '슬러그는 최대 100자까지 허용됩니다.')
    .regex(slugPattern, '슬러그는 소문자, 숫자, 하이픈(-)만 포함할 수 있으며 하이픈으로 시작하거나 끝날 수 없습니다.'),
  description: z.string().max(20000, '설명은 최대 20,000자까지 허용됩니다.').optional().nullable(),
  category: z.string().min(1, '카테고리는 최소 1자 이상이어야 합니다.').max(100, '카테고리는 최대 100자까지 허용됩니다.'),
  coverMediaId: z.number().int().positive('커버 미디어 ID는 양의 정수이어야 합니다.').optional().nullable(),
  mediaIds: z.array(z.number().int().positive()).optional().nullable(),
  postId: z.number().int().positive('관련 포스트 ID는 양의 정수이어야 합니다.').optional().nullable(),
  locale: z.enum(['ko', 'en']),
  tags: z.array(z.string().max(50)).optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(false),
  order: z.number().int().nonnegative('정렬 순서는 0 이상이어야 합니다.').optional().default(0),
});

export const UpdateShowcaseItemSchema = CreateShowcaseItemSchema.partial().omit({ locale: true });

export const ReorderShowcaseItemsSchema = z.object({
  ids: z.array(z.number().int().positive()),
});

export const GetShowcaseQuerySchema = z.object({
  locale: z.enum(['ko', 'en']).optional(),
  category: z.string().optional(),
  featured: z.string().transform((val) => val === 'true').optional(),
});
