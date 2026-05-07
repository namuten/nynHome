import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReports, updateReportStatus } from '../../lib/moderationApi';
import { Check, X, AlertCircle } from 'lucide-react';

interface ReportsTableProps {
  statusFilter?: string;
}

export default function ReportsTable({ statusFilter = 'open' }: ReportsTableProps) {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'reports', statusFilter, page],
    queryFn: () => fetchReports({ status: statusFilter !== 'all' ? statusFilter : undefined, page, limit: 15 }),
  });

  const mutation = useMutation({
    mutationFn: (payload: { id: number; status: string; resolutionNote?: string }) =>
      updateReportStatus('comment', payload.id, { status: payload.status, resolutionNote: payload.resolutionNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-on-surface-variant font-body">신고 목록을 불러오는 중...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 font-body text-sm">
        <AlertCircle className="w-4 h-4" />
        데이터를 불러오지 못했습니다.
      </div>
    );
  }

  const reports = data?.items || [];

  return (
    <div className="space-y-4 font-body">
      <div className="overflow-x-auto bg-white rounded-3xl border border-surface-container shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container/30 text-on-surface-variant text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold w-24">신고 사유</th>
              <th className="p-4 font-semibold">내용 / 대상 댓글</th>
              <th className="p-4 font-semibold w-32">신고자</th>
              <th className="p-4 font-semibold w-28">상태</th>
              <th className="p-4 font-semibold w-32 text-right">처리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-surface-container/10 transition-colors group">
                <td className="p-4">
                  <span className="inline-flex px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100">
                    {report.reason}
                  </span>
                </td>
                <td className="p-4 max-w-xs">
                  <div className="text-xs text-on-surface-variant mb-1 font-medium bg-surface-container/30 p-2 rounded-lg truncate">
                    {report.comment.body}
                  </div>
                  <div className="text-sm text-on-surface line-clamp-2">
                    {report.description || <span className="text-on-surface-variant/50 italic">상세 내용 없음</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-on-surface">{report.reporterUser.nickname}</div>
                  <div className="text-[10px] text-on-surface-variant truncate">{report.reporterUser.email}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${report.status === 'open' ? 'bg-orange-100 text-orange-700' : ''}
                    ${report.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
                    ${report.status === 'rejected' ? 'bg-surface-container text-on-surface-variant' : ''}
                  `}>
                    {report.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {report.status === 'open' && (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => mutation.mutate({ id: report.id, status: 'resolved', resolutionNote: '규정 위반 확인' })}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="처리 완료 (규정 위반)"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => mutation.mutate({ id: report.id, status: 'rejected', resolutionNote: '위반 사항 없음' })}
                        className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                        title="반려 (위반 아님)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {report.status !== 'open' && (
                    <div className="text-xs text-on-surface-variant">처리 완료</div>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant text-sm">
                  신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl border border-surface-container text-sm font-medium hover:bg-surface-container/50 disabled:opacity-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm font-medium text-on-surface-variant">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1.5 rounded-xl border border-surface-container text-sm font-medium hover:bg-surface-container/50 disabled:opacity-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
