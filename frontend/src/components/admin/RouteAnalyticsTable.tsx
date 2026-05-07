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
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span>📍 주요 유입 페이지 분포 (Page Path Stats)</span>
        </h3>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded-full font-bold">
          Top {routes.length} paths
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-white/50 font-semibold text-xs uppercase tracking-wider bg-white/2">
              <th className="py-4 px-6 w-12 text-center">순위</th>
              <th className="py-4 px-6">경로 (Route Path)</th>
              <th className="py-4 px-6 w-48">페이지 뷰 비율</th>
              <th className="py-4 px-6 w-24 text-right">조회수</th>
              <th className="py-4 px-6 w-24 text-right">방문 세션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-white/85">
            {routes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/50 text-xs italic">
                  통계 수집 데이터가 부족합니다.
                </td>
              </tr>
            ) : (
              routes.map((r, idx) => {
                const percentage = Math.round((r.pageViews / maxViews) * 100);
                return (
                  <tr key={r.route} className="hover:bg-white/5 transition-colors">
                    {/* Rank */}
                    <td className="py-4 px-6 text-center whitespace-nowrap text-xs font-mono font-bold text-white/40">
                      {idx + 1}
                    </td>

                    {/* Route */}
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-indigo-300">
                      {r.route}
                    </td>

                    {/* Bar chart indicator */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/40 font-bold w-8">{percentage}%</span>
                      </div>
                    </td>

                    {/* Page Views count */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5 text-white/40" />
                        <span>{r.pageViews.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Unique Sessions count */}
                    <td className="py-4 px-6 text-right font-mono text-white/60 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <Users className="w-3.5 h-3.5 text-white/30" />
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
