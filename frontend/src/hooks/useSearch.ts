import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../lib/searchApi';

/**
 * CJK 전문 검색 React Query 훅
 */
export function useSearch(
  q: string,
  types: ('post' | 'image' | 'video' | 'portfolio')[],
  page: number = 1,
  limit: number = 20
) {
  const trimmedQuery = q.trim();

  return useQuery({
    queryKey: ['search', trimmedQuery, types, page, limit],
    queryFn: () => searchApi.search(trimmedQuery, types, page, limit),
    // 2자 미만일 때는 API 요청 차단하여 부하 절감
    enabled: trimmedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
    staleTime: 5000, // 5초 캐시 유지
  });
}
