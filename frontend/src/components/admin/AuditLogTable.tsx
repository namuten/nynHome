import React, { useState } from 'react';
import type { AuditLog } from '../../types/admin';
import { Eye, ShieldAlert, FileText, Settings, Key, Code, Globe, Laptop } from 'lucide-react';

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete')) return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    if (act.includes('create') || act.includes('post')) return <FileText className="w-4 h-4 text-emerald-400" />;
    if (act.includes('update') || act.includes('put')) return <Settings className="w-4 h-4 text-amber-400" />;
    if (act.includes('login') || act.includes('auth')) return <Key className="w-4 h-4 text-sky-400" />;
    return <Code className="w-4 h-4 text-indigo-400" />;
  };

  const getActionBadgeClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete')) return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    if (act.includes('create') || act.includes('post')) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (act.includes('update') || act.includes('put')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-white/70 font-semibold text-xs uppercase tracking-wider">
              <th className="py-4 px-6">일시</th>
              <th className="py-4 px-6">행위 (Action)</th>
              <th className="py-4 px-6">대상 리소스</th>
              <th className="py-4 px-6">요약 설명</th>
              <th className="py-4 px-6">IP Hash</th>
              <th className="py-4 px-6">환경 (UA)</th>
              <th className="py-4 px-6 text-center">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-white/85">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/50">
                  기록된 감사 로그가 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  {/* 일시 */}
                  <td className="py-4 px-6 whitespace-nowrap text-white/60 text-xs">
                    {formatDate(log.createdAt)}
                  </td>

                  {/* 행위 */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getActionBadgeClass(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>

                  {/* 대상 리소스 */}
                  <td className="py-4 px-6 whitespace-nowrap text-xs font-mono text-white/70">
                    <span className="text-white bg-white/10 px-2 py-1 rounded border border-white/5">
                      {log.resourceType}
                    </span>
                    {log.resourceId && (
                      <span className="ml-1.5 text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">
                        #{log.resourceId}
                      </span>
                    )}
                  </td>

                  {/* 요약 설명 */}
                  <td className="py-4 px-6 max-w-xs truncate text-white/90">
                    {log.summary}
                  </td>

                  {/* IP Hash */}
                  <td className="py-4 px-6 whitespace-nowrap text-xs font-mono text-white/50">
                    {log.ipHash ? (
                      <div className="flex items-center gap-1" title={log.ipHash}>
                        <Globe className="w-3 h-3 text-white/40" />
                        <span>{log.ipHash.slice(0, 10)}...</span>
                      </div>
                    ) : (
                      <span className="text-white/30 italic">N/A</span>
                    )}
                  </td>

                  {/* 환경 */}
                  <td className="py-4 px-6 whitespace-nowrap text-xs text-white/60">
                    {log.userAgentSummary ? (
                      <div className="flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-white/40" />
                        <span>{log.userAgentSummary}</span>
                      </div>
                    ) : (
                      <span className="text-white/30 italic">N/A</span>
                    )}
                  </td>

                  {/* 상세 보기 */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/35 border border-white/10 text-white/80 hover:text-white transition-all"
                      title="상세 메타데이터 보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#12121e]/95 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              <Code className="w-5 h-5 text-indigo-400" />
              감사 로그 상세 정보 (ID: {selectedLog.id})
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-white/50 block text-xs">일시</span>
                  <span className="font-semibold">{formatDate(selectedLog.createdAt)}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-xs">수행 행위</span>
                  <span className="font-mono text-indigo-300 font-bold">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-xs">리소스 타입</span>
                  <span className="font-mono">{selectedLog.resourceType}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-xs">리소스 식별자</span>
                  <span className="font-mono">{selectedLog.resourceId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-xs">관리자 ID</span>
                  <span>{selectedLog.adminUserId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-xs">IP Hash</span>
                  <span className="font-mono text-xs text-white/50 break-all">{selectedLog.ipHash || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-white/50 block text-xs mb-1">상세 요약</span>
                <p className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">{selectedLog.summary}</p>
              </div>

              <div>
                <span className="text-white/50 block text-xs mb-1">메타데이터 (Metadata)</span>
                <pre className="bg-black/60 p-4 rounded-xl border border-white/10 overflow-x-auto text-xs font-mono text-emerald-400 text-left">
                  {selectedLog.metadata
                    ? JSON.stringify(selectedLog.metadata, null, 2)
                    : '// No metadata available'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
