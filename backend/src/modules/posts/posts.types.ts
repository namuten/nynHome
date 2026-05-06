export type PostCategory = 'creative' | 'blog' | 'study';

import { z } from 'zod';

export const PostCategorySchema = z.enum(['creative', 'blog', 'study']);

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
  category: PostCategorySchema,
  thumbnailUrl: z.string().url().optional(),
  isPublished: z.boolean().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const GetPostsQuerySchema = z.object({
  category: PostCategorySchema.optional(),
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 50).optional(),
});

export interface CreatePostDto {
  title: string;
  body: string;
  category: PostCategory;
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  category?: PostCategory;
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export interface ListPostsQuery {
  category?: PostCategory;
  page?: number;
  limit?: number;
}
