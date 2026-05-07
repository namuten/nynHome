import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../lib/operationsApi';
import type { AuditLogQueryParams } from '../lib/operationsApi';
import type { AuditLogListResponse } from '../types/admin';

/**
 * 어드민 감사 로그(Audit Logs) 조회용 커스텀 훅
 */
export function useAuditLogs(params: AuditLogQueryParams) {
  return useQuery<AuditLogListResponse>({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => getAuditLogs(params),
    placeholderData: (previousData) => previousData, // keep previous page data during page transitions
  });
}
