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
    if (act.includes('delete')) return <ShieldAlert className="w-4 h-4 text-red-600" />;
    if (act.includes('create') || act.includes('post')) return <FileText className="w-4 h-4 text-emerald-600" />;
    if (act.includes('update') || act.includes('put')) return <Settings className="w-4 h-4 text-amber-600" />;
    if (act.includes('login') || act.includes('auth')) return <Key className="w-4 h-4 text-sky-600" />;
    return <Code className="w-4 h-4 text-indigo-600" />;
  };

  const getActionBadgeClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete')) return 'bg-red-50 text-red-700 border border-red-200';
    if (act.includes('create') || act.includes('post')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (act.includes('update') || act.includes('put')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
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
      <div className="overflow-x-auto rounded-3xl border border-surface-container bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container bg-surface-container/20 text-on-surface-variant font-bold text-xs uppercase tracking-wider">
              <th className="py-4 px-6">일시</th>
              <th className="py-4 px-6">행위 (Action)</th>
              <th className="py-4 px-6">대상 리소스</th>
              <th className="py-4 px-6">요약 설명</th>
              <th className="py-4 px-6">IP Hash</th>
              <th className="py-4 px-6">환경 (UA)</th>
              <th className="py-4 px-6 text-center">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/50 text-sm text-on-surface font-semibold">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-on-surface-variant font-semibold">
                  기록된 감사 로그가 존재하지 않습니다.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container/10 transition-colors">
                  {/* 일시 */}
                  <td className="py-4 px-6 whitespace-nowrap text-on-surface-variant/80 text-xs font-bold">
                    {formatDate(log.createdAt)}
                  </td>

                  {/* 행위 */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getActionBadgeClass(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>

                  {/* 대상 리소스 */}
                  <td className="py-4 px-6 whitespace-nowrap text-xs font-mono text-on-surface-variant">
                    <span className="text-on-surface bg-surface-container/40 px-2 py-1 rounded border border-surface-container font-black">
                      {log.resourceType}
                    </span>
                    {log.resourceId && (
                      <span className="ml-1.5 text-primary font-black bg-primary/10 px-1.5 py-0.5 rounded border border-primary/10">
                        #{log.resourceId}
                      </span>
                    )}
                  </td>

                  {/* 요약 설명 */}
                  <td className="py-4 px-6 max-w-xs truncate text-on-surface">
                    {log.summary}
                  </td>

                  {/* IP Hash */}
                  <td className="py-4 px-6 whitespace-nowrap text-xs font-mono text-on-surface-variant">
                    {log.ipHash ? (
                      <div className="flex items-center gap-1" title={log.ipHash}>
                        <Globe className="w-3.5 h-3.5 text-on-surface-variant/40" />
                        <span>{log.ipHash.slice(0, 10)}...</span>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant/30 italic">N/A</span>
                    )}
                  </td>

                  {/* 환경 */}
                  <td className="py-4 px-6 whitespace-nowrap text-xs text-on-surface-variant">
                    {log.userAgentSummary ? (
                      <div className="flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-on-surface-variant/40" />
                        <span>{log.userAgentSummary}</span>
                      </div>
                    ) : (
                      <span className="text-on-surface-variant/30 italic">N/A</span>
                    )}
                  </td>

                  {/* 상세 보기 */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-xl bg-surface-container/40 hover:bg-primary-container text-on-surface-variant hover:text-primary border border-surface-container transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-surface-container bg-white p-6 shadow-2xl text-on-surface">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-surface-container pb-3">
              <Code className="w-5 h-5 text-primary" />
              감사 로그 상세 정보 (ID: {selectedLog.id})
            </h3>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 text-sm bg-surface-container/20 p-4 rounded-2xl border border-surface-container">
                <div>
                  <span className="text-on-surface-variant/70 block text-xs font-bold">일시</span>
                  <span className="font-bold">{formatDate(selectedLog.createdAt)}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block text-xs font-bold">수행 행위</span>
                  <span className="font-mono text-primary font-black">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block text-xs font-bold">리소스 타입</span>
                  <span className="font-mono font-bold">{selectedLog.resourceType}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block text-xs font-bold">리소스 식별자</span>
                  <span className="font-mono font-bold">{selectedLog.resourceId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block text-xs font-bold">관리자 ID</span>
                  <span className="font-bold">{selectedLog.adminUserId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block text-xs font-bold">IP Hash</span>
                  <span className="font-mono text-xs text-on-surface-variant font-bold break-all">{selectedLog.ipHash || 'N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant/70 block text-xs font-bold mb-1">상세 요약</span>
                <p className="bg-surface-container/20 p-3 rounded-xl border border-surface-container text-sm font-semibold">{selectedLog.summary}</p>
              </div>

              <div>
                <span className="text-on-surface-variant/70 block text-xs font-bold mb-1">메타데이터 (Metadata)</span>
                <pre className="bg-surface-container/30 p-4 rounded-xl border border-surface-container overflow-x-auto text-xs font-mono text-indigo-700 font-semibold text-left">
                  {selectedLog.metadata
                    ? JSON.stringify(selectedLog.metadata, null, 2)
                    : '// No metadata available'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-surface-container pb-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white hover:text-primary font-bold shadow-sm hover:shadow transition-all"
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
