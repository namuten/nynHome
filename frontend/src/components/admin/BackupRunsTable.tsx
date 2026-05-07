import { useState } from 'react';
import type { BackupRunItem } from '../../lib/operationsApi';
import { Calendar, HardDrive, CheckCircle2, AlertTriangle, Copy, Check } from 'lucide-react';

interface BackupRunsTableProps {
  runs: BackupRunItem[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
}

export default function BackupRunsTable({
  runs,
  total,
  page,
  totalPages,
  onPageChange,
  isLoading,
}: BackupRunsTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const formatBytes = (bytes: number | null) => {
    if (bytes === null || bytes === undefined) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopyChecksum = (id: number, checksum: string) => {
    navigator.clipboard.writeText(checksum);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-[32px] border border-surface-container overflow-hidden shadow-sm">
      {/* Table Header Section */}
      <div className="px-6 py-5 border-b border-surface-container bg-surface-container-low/30 flex items-center justify-between">
        <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <span>데이터베이스 백업 기록 이력</span>
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary font-black px-2 py-0.5 rounded-lg select-none">
          자동 및 수동 감사
        </span>
      </div>

      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-on-surface-variant font-bold">백업 이력 내역 로드 중...</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="p-16 text-center space-y-3">
          <span className="text-4xl block">💾</span>
          <p className="text-sm font-bold text-on-surface-variant">기록된 백업 이력이 존재하지 않습니다.</p>
          <p className="text-[10px] text-on-surface-variant font-medium">상단의 수동 백업 생성 버튼으로 첫 스키마 백업을 시작해 보세요.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container/60 bg-surface-container-low/10 text-[10px] text-on-surface-variant font-bold select-none">
                <th className="px-6 py-3.5">ID / 구분</th>
                <th className="px-6 py-3.5">상태</th>
                <th className="px-6 py-3.5">생성 위치 및 파일 정보</th>
                <th className="px-6 py-3.5">파일 크기</th>
                <th className="px-6 py-3.5">MD5 체크섬</th>
                <th className="px-6 py-3.5">시작 시각 / 소요 시간</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/50 text-xs">
              {runs.map((run) => {
                // Compute duration
                let durationText = '-';
                if (run.finishedAt) {
                  const diff = new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime();
                  durationText = `${(diff / 1000).toFixed(1)}초`;
                }

                return (
                  <tr key={run.id} className="hover:bg-surface-container-lowest/40 transition duration-150">
                    {/* ID / Type */}
                    <td className="px-6 py-4 font-semibold text-on-surface">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">#{run.id}</span>
                        <span className="text-[9px] text-on-surface-variant mt-0.5 bg-surface-container px-1.5 py-0.5 rounded-md w-max select-none">
                          {run.backupType}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {run.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-xl text-[10px] font-bold border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>성공</span>
                        </span>
                      )}
                      {run.status === 'RUNNING' && (
                        <span className="inline-flex items-center gap-1 bg-primary/5 text-primary px-2 py-1 rounded-xl text-[10px] font-bold border border-primary/10">
                          <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin shrink-0" />
                          <span>백업 진행 중</span>
                        </span>
                      )}
                      {run.status === 'FAILED' && (
                        <div className="flex flex-col max-w-[200px]" title={run.errorMessage || ''}>
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-xl text-[10px] font-bold border border-red-100 w-max">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>실패</span>
                          </span>
                          <span className="text-[9px] text-red-500 mt-1 font-medium line-clamp-1">
                            {run.errorMessage}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* File URL */}
                    <td className="px-6 py-4 font-medium text-on-surface">
                      {run.fileUrl ? (
                        <a
                          href={run.fileUrl}
                          download
                          className="text-primary font-bold hover:underline break-all block max-w-[250px]"
                          title="서버 보관소에서 SQL 아카이브 직접 다운로드"
                        >
                          {run.fileUrl.split('/').pop()}
                        </a>
                      ) : (
                        <span className="text-on-surface-variant font-medium text-[11px]">-</span>
                      )}
                    </td>

                    {/* File Size */}
                    <td className="px-6 py-4 font-bold text-on-surface-variant">
                      {formatBytes(run.sizeBytes)}
                    </td>

                    {/* Checksum */}
                    <td className="px-6 py-4">
                      {run.checksum ? (
                        <div className="flex items-center gap-1.5 max-w-[140px]">
                          <span className="font-mono text-[10px] text-on-surface-variant truncate bg-surface-container-low px-1.5 py-0.5 rounded-md" title={run.checksum}>
                            {run.checksum}
                          </span>
                          <button
                            onClick={() => handleCopyChecksum(run.id, run.checksum!)}
                            className="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition"
                            title="MD5 키보드 복사"
                          >
                            {copiedId === run.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant font-medium text-[11px]">-</span>
                      )}
                    </td>

                    {/* Timing */}
                    <td className="px-6 py-4 text-on-surface-variant font-medium">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{new Date(run.startedAt).toLocaleString('ko-KR')}</span>
                        </span>
                        <span className="text-[10px] text-primary font-bold mt-1 bg-primary/5 px-1.5 py-0.5 rounded-md w-max">
                          소요 시간: {durationText}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-surface-container-low/20 border-t border-surface-container flex items-center justify-between select-none">
          <span className="text-[10px] text-on-surface-variant font-bold">
            총 {total}개 기록 중 {page} / {totalPages} 페이지
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || isLoading}
              className="px-3 py-1 bg-white border border-surface-container rounded-xl text-[10px] font-bold text-on-surface-variant hover:bg-surface-container/10 active:scale-95 disabled:opacity-50 disabled:scale-100 transition duration-200"
            >
              이전
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || isLoading}
              className="px-3 py-1 bg-white border border-surface-container rounded-xl text-[10px] font-bold text-on-surface-variant hover:bg-surface-container/10 active:scale-95 disabled:opacity-50 disabled:scale-100 transition duration-200"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
