import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/adminApi';

/**
 * 어드민 대시보드 데이터 조회용 커스텀 훅
 * - 단일 API 호출(GET /api/admin/dashboard)을 통해 모든 통계 및 최근 활동 데이터를 확보합니다.
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getAdminDashboard(),
  });
}
