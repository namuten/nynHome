import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../lib/tagsApi';

/**
 * 전체 태그 목록 리스트 조회 훅
 */
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getTags,
    staleTime: 10000,
  });
}

/**
 * 특정 태그 슬러그별 상세 콘텐츠 목록 조회 훅
 */
export function useTagBySlug(slug: string) {
  return useQuery({
    queryKey: ['tag', slug],
    queryFn: () => tagsApi.getTagBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * [어드민] 신규 태그 생성 뮤테이션 훅
 */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * [어드민] 태그 정보 개정 뮤테이션 훅
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; slug?: string; color?: string } }) =>
      tagsApi.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * [어드민] 태그 제거 뮤테이션 훅
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * [어드민] 콘텐츠 태그 맵핑 추가 훅
 */
export function useAttachTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.attachTagToContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * [어드민] 콘텐츠 태그 맵핑 삭제 훅
 */
export function useDetachTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.detachTagFromContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
