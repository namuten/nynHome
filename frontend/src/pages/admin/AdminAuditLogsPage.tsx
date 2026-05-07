import { useState } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLogTable } from '../../components/admin/AuditLogTable';
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');

  // Fetch real logs using the react-query custom hook
  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    limit,
    action: actionFilter || undefined,
    resourceType: resourceTypeFilter || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filtering changes
  };

  return (
    <div className="space-y-8 font-body select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Operational Integrity</span>
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            관리자 감사 로그
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            데이터 위변조 방지 및 비즈니스 투명성 유지를 위해 관리자가 행한 모든 자원 생성/수정/삭제 활동을 실시간으로 기록하고 모니터링합니다.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>새로고침</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span>검색 필터</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Action Filter Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                handleFilterChange();
              }}
              placeholder="행위(Action)로 검색... (예: post.create)"
              className="w-full bg-black/40 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-2 text-xs border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Resource Type Filter Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={resourceTypeFilter}
              onChange={(e) => {
                setResourceTypeFilter(e.target.value);
                handleFilterChange();
              }}
              placeholder="리소스 타입으로 검색... (예: media-types)"
              className="w-full bg-black/40 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-2 text-xs border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Logs Table or Load State */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <span className="text-sm text-white/60 font-bold">감사 로그 목록을 가져오는 중입니다...</span>
        </div>
      ) : isError ? (
        <div className="py-20 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <p className="text-rose-400 font-bold">로그 데이터를 서버로부터 불러오는데 실패하였습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AuditLogTable logs={data?.data || []} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-black/20 p-4 border border-white/5 rounded-2xl">
              <span className="text-xs text-white/60">
                총 {data?.total}개 항목 중 {(page - 1) * limit + 1}~{Math.min(page * limit, data?.total || 0)}번째 로그 표시
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/10 rounded-lg text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-white font-bold px-3">
                  {page} / {totalPages} 페이지
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/10 rounded-lg text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
