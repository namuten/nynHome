import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CommentItem } from '../types/api';

export function useComments(postId: number) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await api.get<CommentItem[]>(`/posts/${postId}/comments`);
      return response.data;
    },
    enabled: !isNaN(postId),
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ body, parentId }: { body: string; parentId?: number | null }) => {
      const response = await api.post<CommentItem>(`/posts/${postId}/comments`, { body, parentId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  return {
    commentsQuery,
    createComment: createCommentMutation,
  };
}
