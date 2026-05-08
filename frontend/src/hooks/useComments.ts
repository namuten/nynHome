import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { CommentItem } from '../types/api';

export function useComments(postId: number) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await api.get<any>(`/posts/${postId}/comments`);
      const rawData = response.data;
      return (Array.isArray(rawData) ? rawData : rawData?.data || []) as CommentItem[];
    },
    enabled: !isNaN(postId),
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ body, parentId }: { body: string; parentId?: number | null }) => {
      const { pendingComments } = await import('../lib/offlineComments');

      // 1. 브라우저가 물리적으로 오프라인 상태일 때 즉각 로컬 IndexedDB로 구출
      if (!navigator.onLine) {
        await pendingComments.add({ postId, content: body });
        throw new Error('OFFLINE_SAVED');
      }

      try {
        const response = await api.post<CommentItem>(`/posts/${postId}/comments`, { body, parentId });
        return response.data;
      } catch (err) {
        // 2. 네트워크 일시 장애로 실패한 경우에도 IndexedDB 구출 및 에러 표출
        await pendingComments.add({ postId, content: body });
        throw new Error('OFFLINE_SAVED');
      }
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
