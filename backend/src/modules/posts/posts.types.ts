export type PostCategory = 'creative' | 'blog' | 'study';

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
