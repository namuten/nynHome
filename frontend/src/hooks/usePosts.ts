import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PaginatedResponse, PostSummary, PostCategory } from '../types/api';

interface UsePostsOptions {
  category?: PostCategory;
  page?: number;
  limit?: number;
}

export function usePosts({ category, page = 1, limit = 9 }: UsePostsOptions = {}) {
  return useQuery({
    queryKey: ['posts', { category, page, limit }],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<PostSummary>>('/posts', {
        params: { category, page, limit },
      });
      return response.data;
    },
  });
}
