import React from 'react';
import { Eye, Compass, Users } from 'lucide-react';

interface RouteStat {
  route: string;
  pageViews: number;
  uniqueSessions: number;
}

interface RouteAnalyticsTableProps {
  routes?: RouteStat[];
}

export const RouteAnalyticsTable: React.FC<RouteAnalyticsTableProps> = ({ routes = [] }) => {
  const maxViews = routes.length > 0 ? Math.max(...routes.map((r) => r.pageViews)) : 1;

  return (
    <div className="rounded-3xl border border-surface-container bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-surface-container bg-surface-container/20 flex items-center justify-between">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          <span>📍 주요 유입 페이지 분포 (Page Path Stats)</span>
        </h3>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
          Top {routes.length} paths
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container text-on-surface-variant font-bold text-xs uppercase tracking-wider bg-surface-container/10">
              <th className="py-4 px-6 w-12 text-center">순위</th>
              <th className="py-4 px-6">경로 (Route Path)</th>
              <th className="py-4 px-6 w-48">페이지 뷰 비율</th>
              <th className="py-4 px-6 w-24 text-right">조회수</th>
              <th className="py-4 px-6 w-24 text-right">방문 세션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/50 text-sm text-on-surface font-semibold">
            {routes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-on-surface-variant font-semibold text-xs">
                  통계 수집 데이터가 부족합니다.
                </td>
              </tr>
            ) : (
              routes.map((r, idx) => {
                const percentage = Math.round((r.pageViews / maxViews) * 100);
                return (
                  <tr key={r.route} className="hover:bg-surface-container/10 transition-colors">
                    {/* Rank */}
                    <td className="py-4 px-6 text-center whitespace-nowrap text-xs font-mono font-bold text-on-surface-variant/70">
                      {idx + 1}
                    </td>

                    {/* Route */}
                    <td className="py-4 px-6 font-mono text-xs font-bold text-primary">
                      {r.route}
                    </td>

                    {/* Bar chart indicator */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-surface-container border border-surface-container rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-on-surface-variant/80 font-bold w-8">{percentage}%</span>
                      </div>
                    </td>

                    {/* Page Views count */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-on-surface whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5 text-on-surface-variant/50" />
                        <span>{r.pageViews.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Unique Sessions count */}
                    <td className="py-4 px-6 text-right font-mono text-on-surface-variant whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <Users className="w-3.5 h-3.5 text-on-surface-variant/40" />
                        <span>{r.uniqueSessions.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
