import { Server, ShieldCheck, Database, RefreshCw, HardDrive, FileCheck, CheckCircle } from 'lucide-react';

export default function AdminOperationsPage() {
  const mockSystemStatus = [
    { label: '데이터베이스 (MySQL)', status: '정상 작동', detail: 'Connection: OK', icon: Database, color: 'text-green-500' },
    { label: '오브젝트 스토리지 (Media R2)', status: '정상 연결', detail: 'Bucket: nyn-home-media', icon: HardDrive, color: 'text-green-500' },
    { label: '시스템 메모리 (RAM)', status: '여유로움', detail: 'Memory usage: 32.4%', icon: Server, color: 'text-green-500' },
  ];

  const mockBackups = [
    { id: 1, type: 'full', status: 'SUCCESS', date: '2026-05-07 04:00:00', size: '124.5 MB', checksum: 'sha256:d87e...f33b' },
    { id: 2, type: 'db', status: 'SUCCESS', date: '2026-05-06 04:00:00', size: '12.4 MB', checksum: 'sha256:32c1...9c1a' },
  ];

  return (
    <div className="space-y-8 font-body select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>Infra & Systems</span>
          </div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
            시스템 운영 상태 및 복구
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            크록허브 백엔드 서버 인프라 원격 상태 체크 및 DB 백업 절차 스냅샷 현황판입니다.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>시스템 헬스 체크</span>
        </button>
      </div>

      {/* Grid: Infrastructure status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockSystemStatus.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white/80 border border-surface-container/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex gap-4">
              <div className={`p-3 bg-surface-container rounded-2xl ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant">{s.label}</h4>
                <div className="text-lg font-black text-on-surface mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span>{s.status}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{s.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backup Runs Section */}
      <div className="bg-white/80 border border-surface-container/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-surface-container/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span>💾 백업 생성 기록 (Backup Runs)</span>
          </h3>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl hover:shadow-sm transition-all self-start sm:self-center">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>수동 백업 기동</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/20 text-[11px] font-black text-on-surface-variant uppercase tracking-wider border-b border-surface-container">
                <th className="py-4 px-6">백업 종류</th>
                <th className="py-4 px-6">상태 (Status)</th>
                <th className="py-4 px-6">생성 일시</th>
                <th className="py-4 px-6">용량 (Size)</th>
                <th className="py-4 px-6 text-right">체크섬 해시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-xs">
              {mockBackups.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container/10 transition-colors">
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] bg-primary/10 text-primary">
                      {b.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-green-600 flex items-center gap-1.5 mt-2.5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{b.status}</span>
                  </td>
                  <td className="py-4 px-6 font-mono text-on-surface-variant text-[11px]">{b.date}</td>
                  <td className="py-4 px-6 font-bold text-on-surface">{b.size}</td>
                  <td className="py-4 px-6 text-right font-mono text-on-surface-variant text-[11px]">{b.checksum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
