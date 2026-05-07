import { ShieldAlert, RefreshCw, ChevronDown, CheckCircle } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const mockLogs = [
    { id: 1, action: 'seo.update', resourceType: 'seo', resourceId: 'home', admin: 'Admin (admin@crochub.dev)', summary: '메인 홈 SEO 메타데이터 업데이트', date: '2026-05-07 11:15:32', ip: '4f28***8d38', reqId: 'req_8f11b81030ef' },
    { id: 2, action: 'showcase.create', resourceType: 'showcase', resourceId: 'webgl-monster-lab', admin: 'Admin (admin@crochub.dev)', summary: '신규 작품 "WebGL Monster Lab" 쇼케이스 등록', date: '2026-05-07 10:45:11', ip: '4f28***8d38', reqId: 'req_28f2e4ad2388' },
    { id: 3, action: 'profile.update', resourceType: 'profile', resourceId: 'ko', admin: 'Admin (admin@crochub.dev)', summary: '국문 기본 이력 요약 프로필 수정', date: '2026-05-07 09:12:05', ip: '4f28***8d38', reqId: 'req_1032aa98d476' },
  ];

  return (
    <div className="space-y-8 font-body select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Operational Integrity</span>
          </div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
            관리자 감사 로그
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            데이터 위변조 방지 및 비즈니스 투명성 유지를 위해 관리자가 행한 모든 자원 생성/수정/삭제 활동을 정밀 기록합니다.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>감사 로그 갱신</span>
        </button>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white/80 border border-surface-container/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-container/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <span>📋 활동 타임라인</span>
          </h3>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-[10px] text-on-surface-variant font-bold">인덱스 필터:</span>
            <div className="flex bg-surface-container p-0.5 rounded-lg border border-outline-variant/30 text-[10px] font-bold text-on-surface-variant">
              <button className="px-2 py-1 bg-white rounded-md shadow-sm text-primary">전체 활동</button>
              <button className="px-2 py-1 hover:text-on-surface">자원 생성</button>
              <button className="px-2 py-1 hover:text-on-surface">수정/삭제</button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/20 text-[11px] font-black text-on-surface-variant uppercase tracking-wider border-b border-surface-container">
                <th className="py-4 px-6">발생 일시</th>
                <th className="py-4 px-6">활동 유형 (Action)</th>
                <th className="py-4 px-6">수행 관리자</th>
                <th className="py-4 px-6">상세 요약 및 자원 키</th>
                <th className="py-4 px-6 text-right">요청식별자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container/10 transition-colors">
                  <td className="py-4 px-6 font-mono text-on-surface-variant text-[11px]">{log.date}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] bg-primary/10 text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-on-surface">{log.admin}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-on-surface">{log.summary}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                      Resource: {log.resourceType} / {log.resourceId}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-on-surface-variant text-[11px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{log.reqId}</span>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
