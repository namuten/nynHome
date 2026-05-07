import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Server, Database, RefreshCw, HardDrive, ShieldCheck } from 'lucide-react';
import { getSystemHealth, getBackupRuns, triggerAdminBackupRun } from '../../lib/operationsApi';
import BackupRunsTable from '../../components/admin/BackupRunsTable';

export default function AdminOperationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // 1. Fetch system health telemetry
  const {
    data: health,
    isLoading: isHealthLoading,
    isRefetching: isHealthRefetching,
    refetch: refetchHealth,
    error: healthError,
  } = useQuery({
    queryKey: ['admin', 'systemHealth'],
    queryFn: () => getSystemHealth(),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // 2. Fetch paginated backup logs
  const {
    data: backups,
    isLoading: isBackupsLoading,
    refetch: refetchBackups,
  } = useQuery({
    queryKey: ['admin', 'backupRuns', page],
    queryFn: () => getBackupRuns({ page, limit: 10 }),
  });

  // 3. Mutation to trigger manual database backup
  const triggerBackupMutation = useMutation({
    mutationFn: () => triggerAdminBackupRun(),
    onSuccess: () => {
      // Refresh list immediately so the RUNNING item is visible
      queryClient.invalidateQueries({ queryKey: ['admin', 'backupRuns'] });
    },
  });

  const handleManualBackup = () => {
    if (triggerBackupMutation.isPending) return;
    triggerBackupMutation.mutate();
  };

  const handleGlobalRefresh = () => {
    refetchHealth();
    refetchBackups();
  };

  // Convert system health response to cards
  const systemCards = [
    {
      label: '데이터베이스 (MySQL)',
      status: isHealthLoading ? '진단 중...' : health?.database === 'ok' ? '정상 작동' : '오류 감지',
      detail: healthError ? '연결 실패' : isHealthLoading ? '수신 대기 중' : 'Connection: OK (SELECT 1)',
      icon: Database,
      color: health?.database === 'ok' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50',
      statusColor: health?.database === 'ok' ? 'bg-green-500' : 'bg-red-500',
    },
    {
      label: '오브젝트 스토리지 (S2/R2)',
      status: isHealthLoading ? '진단 중...' : health?.storage === 'ok' ? '정상 연결' : '읽기/쓰기 차단',
      detail: isHealthLoading ? '수신 대기 중' : health?.storage === 'ok' ? 'Bucket: nyn-home-media' : '권한 확인 필요',
      icon: HardDrive,
      color: health?.storage === 'ok' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50',
      statusColor: health?.storage === 'ok' ? 'bg-green-500' : 'bg-red-500',
    },
    {
      label: '애플리케이션 업타임 (Core)',
      status: isHealthLoading ? '수신 중...' : `가동 중`,
      detail: isHealthLoading
        ? '계산 중'
        : `Uptime: ${(health?.uptimeSeconds || 0).toLocaleString('ko-KR')}초`,
      icon: Server,
      color: 'text-primary bg-primary/5',
      statusColor: 'bg-primary',
    },
  ];

  return (
    <div className="space-y-8 font-body animate-fade-in">
      {/* Page Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-6 select-none">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Infra & Core Systems</span>
          </div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
            시스템 운영 및 복구 센터
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
            크록허브 백엔드 코어 인프라 자산의 실시간 가용 지표 및 스키마 백업 절차를 통제합니다.
          </p>
        </div>
        <button
          onClick={handleGlobalRefresh}
          disabled={isHealthLoading || isHealthRefetching}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 self-start sm:self-center select-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isHealthRefetching ? 'animate-spin' : ''}`} />
          <span>시스템 원격 정밀 진단</span>
        </button>
      </div>

      {/* Grid: Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        {systemCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-surface-container/60 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 items-center"
            >
              <div className={`p-4.5 rounded-2xl ${card.color} transition duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                  {card.label}
                </h4>
                <div className="text-base font-black text-on-surface mt-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${card.statusColor} inline-block shrink-0`} />
                  <span className="truncate">{card.status}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono mt-1 truncate">
                  {card.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Action & Live Warnings Box */}
      <div className="bg-white/50 border border-surface-container/60 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 min-w-0 flex-1">
          <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5 select-none">
            <HardDrive className="w-4 h-4 text-primary" />
            <span>수동 백업 프로세스 강제 트리거</span>
          </h4>
          <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
            클라우드 자동 스케줄 외에 즉시 독립적인 MySQL 덤프 아카이브를 빌드하여 백업 로그에
            등록합니다. 백업이 기동되면 시스템 과부하를 최소화하며 백그라운드에서 암호화 체크섬을
            조직합니다.
          </p>
        </div>

        <button
          onClick={handleManualBackup}
          disabled={triggerBackupMutation.isPending}
          className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-on-surface text-surface text-xs font-black rounded-2xl hover:bg-on-surface/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 select-none"
        >
          {triggerBackupMutation.isPending ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>백업 인프라 준비 중...</span>
            </>
          ) : (
            <>
              <span>즉시 DB 백업 기동</span>
            </>
          )}
        </button>
      </div>

      {/* Backup Runs Paginated logs Table */}
      <BackupRunsTable
        runs={backups?.items || []}
        total={backups?.total || 0}
        page={page}
        totalPages={backups?.totalPages || 1}
        onPageChange={(newPage) => setPage(newPage)}
        isLoading={isBackupsLoading}
      />
    </div>
  );
}
