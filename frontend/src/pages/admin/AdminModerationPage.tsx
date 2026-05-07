import { useState } from 'react';
import ModerationQueueList from '../../components/admin/ModerationQueueList';
import { EyeOff, ShieldAlert, Layers } from 'lucide-react';

type QueueStatus = 'open' | 'all';

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<QueueStatus>('open');

  return (
    <div className="space-y-8 font-body animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <EyeOff className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
              콘텐츠 모더레이션
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
            신고 접수되거나 정밀 필터링(Spam Guard)에 의해 격리된 콘텐츠를 직접 블라인드 처리하거나 구제합니다.
          </p>
        </div>

        {/* Quick Filter */}
        <div className="flex bg-surface-container/50 p-1 rounded-2xl border border-surface-container self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('open')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'open'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>검토 대기중</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>전체 내역</span>
          </button>
        </div>
      </div>

      {/* Moderation Warning / Guideline Card */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 p-5 rounded-3xl flex items-start gap-4">
        <div className="p-2.5 bg-red-500/10 rounded-2xl text-red-500 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black text-on-surface">모더레이션 실행 가이드라인</h4>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            블라인드 처리 시 실시간으로 사용자 화면에서 댓글이 완전히 마스킹(숨김) 처리되며, 관리 로그 및 Audit Log에 기록됩니다.
            제재 사유가 모호한 경우, 임의 숨김 처리에 앞서 커뮤니티 정책 및 서비스 가이드라인의 정확한 조항과 대조해 본 후 결정해 주시기 바랍니다.
          </p>
        </div>
      </div>

      {/* Queue Grid List */}
      <div>
        <ModerationQueueList statusFilter={activeTab === 'open' ? 'open' : undefined} />
      </div>
    </div>
  );
}

