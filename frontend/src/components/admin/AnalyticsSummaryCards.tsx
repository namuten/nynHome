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
      color: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/25',
    },
    {
      title: '고유 방문 세션 (Unique Sessions)',
      value: summary?.totalUniqueSessions ?? 0,
      icon: Users,
      color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/25',
    },
    {
      title: '세션당 평균 탐색 depth',
      value: summary?.avgViewsPerSession ? `${summary.avgViewsPerSession} pages` : '0 pages',
      icon: BarChart3,
      color: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/25',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${s.color} p-6 shadow-xl backdrop-blur-md hover:scale-[1.01] active:scale-[0.99] transition-all`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                  {s.title}
                </p>
                <h3 className="text-3xl font-display font-black text-white tracking-tight">
                  {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                </h3>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <Icon className="w-5 h-5" />
              </div>
            </div>
            {/* Ambient subtle glow background */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
          </div>
        );
      })}
    </div>
  );
};
