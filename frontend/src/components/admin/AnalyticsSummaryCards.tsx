import React from 'react';
import { Eye, Users, BarChart3 } from 'lucide-react';

interface SummaryData {
  totalPageViews: number;
  totalUniqueSessions: number;
  avgViewsPerSession: number;
}

interface AnalyticsSummaryCardsProps {
  summary?: SummaryData;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summary }) => {
  const stats = [
    {
      title: '누적 페이지 뷰 (Page Views)',
      value: summary?.totalPageViews ?? 0,
      icon: Eye,
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50/40 border-indigo-100',
    },
    {
      title: '고유 방문 세션 (Unique Sessions)',
      value: summary?.totalUniqueSessions ?? 0,
      icon: Users,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50/40 border-emerald-100',
    },
    {
      title: '세션당 평균 탐색 depth',
      value: summary?.avgViewsPerSession ? `${summary.avgViewsPerSession} pages` : '0 pages',
      icon: BarChart3,
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50/40 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-3xl border shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all p-6 bg-white ${s.bgColor}`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-on-surface-variant font-bold text-xs uppercase tracking-wider mb-1.5">
                  {s.title}
                </p>
                <h3 className="text-3xl font-display font-black text-on-surface tracking-tight">
                  {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                </h3>
              </div>
              <div className={`p-3 bg-white border border-surface-container/60 rounded-xl shadow-sm ${s.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            {/* Ambient subtle glow background */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-surface-container/20 blur-2xl pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
};
