import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/adminApi';

interface CommentFilterParams {
  page: number;
  limit: number;
  status: 'visible' | 'hidden' | 'all';
  q?: string;
  postId?: number;
}

/**
 * 어드민 댓글 제어 및 관리용 커스텀 훅
 * - 전체 댓글 목록 조회(필터링, 페이징, 검색어 지원)
 * - 댓글 숨김/해제 처리(PATCH) 및 관리자 답글 등록(PUT) 통합 관리
 */
export function useAdminComments(params: CommentFilterParams) {
  const queryClient = useQueryClient();

  // 1. 댓글 조회 쿼리
  const commentsQuery = useQuery({
    queryKey: ['admin', 'comments', params],
    queryFn: () => adminApi.getAdminComments(params),
  });

  // 2. 댓글 숨김/해제 처리 뮤테이션
  const toggleHideMutation = useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) =>
      adminApi.setAdminCommentHidden(id, isHidden),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }); // 대시보드 메트릭 연동 갱신
    },
  });

  // 3. 관리자 답글 등록 뮤테이션
  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) =>
      adminApi.replyToComment(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  return {
    commentsQuery,
    toggleHideMutation,
    replyMutation,
  };
}
