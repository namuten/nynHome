import { useState } from 'react';
import ReportsTable from '../../components/admin/ReportsTable';
import { ShieldAlert, Inbox, CheckCircle, XCircle } from 'lucide-react';

type FilterStatus = 'all' | 'open' | 'resolved' | 'rejected';

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<FilterStatus>('open');

  const tabs: { key: FilterStatus; label: string; icon: any; colorClass: string }[] = [
    { key: 'open', label: '처리 대기중', icon: Inbox, colorClass: 'text-orange-500' },
    { key: 'resolved', label: '처리 완료', icon: CheckCircle, colorClass: 'text-green-500' },
    { key: 'rejected', label: '반려됨', icon: XCircle, colorClass: 'text-on-surface-variant' },
    { key: 'all', label: '전체 보기', icon: ShieldAlert, colorClass: 'text-primary' },
  ];

  return (
    <div className="space-y-8 font-body animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
            신고 내역 관리
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1">
          사용자들로부터 접수된 부적절한 댓글 및 콘텐츠 신고 내역을 통합 모니터링하고 제어합니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-surface-container pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-2xl transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.colorClass}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm">
        <ReportsTable statusFilter={activeTab} />
      </div>
    </div>
  );
}

