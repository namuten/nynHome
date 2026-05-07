import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchModerationQueue, moderateComment } from '../../lib/moderationApi';
import { AlertTriangle, EyeOff, Shield, ShieldCheck } from 'lucide-react';

interface ModerationQueueListProps {
  statusFilter?: string;
}

export default function ModerationQueueList({ statusFilter = 'open' }: ModerationQueueListProps) {
  const queryClient = useQueryClient();

  const { data: queueItems, isLoading, isError } = useQuery({
    queryKey: ['admin', 'moderation-queue', statusFilter],
    queryFn: () => fetchModerationQueue({ status: statusFilter }),
  });

  const moderateMutation = useMutation({
    mutationFn: (payload: { targetId: number; isHidden: boolean; hiddenReason: string }) =>
      moderateComment(payload.targetId, { isHidden: payload.isHidden, hiddenReason: payload.hiddenReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
      // Also invalidate reports to sync statuses
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-on-surface-variant font-body">큐를 불러오는 중...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2 font-body text-sm">
        <AlertTriangle className="w-4 h-4" />
        데이터를 불러오지 못했습니다.
      </div>
    );
  }

  if (!queueItems || queueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center font-body bg-white rounded-3xl border border-surface-container shadow-sm">
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">모든 항목이 안전합니다</h3>
        <p className="text-sm text-on-surface-variant">처리 대기 중인 모더레이션 큐가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 font-body">
      {queueItems.map((item) => (
        <div key={item.queueId} className="bg-white rounded-3xl border border-surface-container shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-red-800 tracking-tight">{item.kind.toUpperCase()} REPORT</div>
                <div className="text-[10px] text-red-600 font-medium">사유: {item.reason}</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              item.isHidden ? 'bg-red-200 text-red-800' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {item.isHidden ? 'BLINDED' : 'VISIBLE'}
            </span>
          </div>
          
          <div className="p-5 flex-1 flex flex-col space-y-4">
            <div className="bg-surface-container/20 p-4 rounded-2xl border border-surface-container text-sm text-on-surface whitespace-pre-wrap flex-1">
              {item.contentBody}
            </div>
            
            <div className="text-xs text-on-surface-variant bg-surface-container/10 p-3 rounded-xl">
              <span className="font-bold text-on-surface">신고자:</span> {item.reporter}
              {item.description && (
                <div className="mt-1 border-t border-surface-container pt-1 mt-2">
                  <span className="font-bold text-on-surface block mb-0.5">상세 설명:</span>
                  {item.description}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-surface-container bg-surface-container/5 flex gap-2">
            <button
              onClick={() => moderateMutation.mutate({ targetId: item.targetId, isHidden: true, hiddenReason: 'admin_action' })}
              disabled={item.isHidden || moderateMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <EyeOff className="w-4 h-4" />
              <span>숨김 처리</span>
            </button>
            <button
              onClick={() => moderateMutation.mutate({ targetId: item.targetId, isHidden: false, hiddenReason: '' })}
              disabled={!item.isHidden || moderateMutation.isPending}
              className="flex-1 px-4 py-2 bg-white hover:bg-surface-container border border-outline-variant text-on-surface text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4" />
              <span>복구 (안전)</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
