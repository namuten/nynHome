import { useState } from 'react';
import { useAdminAnalyticsSummary, useAdminRouteAnalytics } from '../../hooks/useAdminAnalytics';
import { AnalyticsSummaryCards } from '../../components/admin/AnalyticsSummaryCards';
import { RouteAnalyticsTable } from '../../components/admin/RouteAnalyticsTable';
import { Globe, RefreshCw, ShieldAlert, Calendar, LayoutDashboard } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<'7days' | '30days' | 'all'>('30days');

  // Compute from date based on range
  const getFromDate = () => {
    const d = new Date();
    if (range === '7days') {
      d.setDate(d.getDate() - 7);
    } else if (range === '30days') {
      d.setDate(d.getDate() - 30);
    } else {
      return '2026-01-01'; // Default epoch start for ALL
    }
    return d.toISOString().split('T')[0];
  };

  const from = getFromDate();
  const to = new Date().toISOString().split('T')[0];

  const summaryQuery = useAdminAnalyticsSummary({ from, to });
  const routesQuery = useAdminRouteAnalytics({ from, to, limit: 10 });

  const handleRefresh = () => {
    summaryQuery.refetch();
    routesQuery.refetch();
  };

  const isLoading = summaryQuery.isLoading || routesQuery.isLoading;
  const isError = summaryQuery.isError || routesQuery.isError;

  return (
    <div className="space-y-8 font-body select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Operational Telemetry</span>
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            서비스 방문 통계
          </h1>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            크록허브 플랫폼의 방문 지표, 인기 유입 경로 및 세션 통계를 실시간 종합 집계합니다.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>통계 새로고침</span>
        </button>
      </div>

      {/* Date Range Select Area */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white/80 font-bold text-sm">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>집계 기간 범위</span>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-bold text-white/60">
          <button
            onClick={() => setRange('7days')}
            className={`px-4 py-1.5 rounded-lg transition-all ${range === '7days' ? 'bg-indigo-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            최근 7일
          </button>
          <button
            onClick={() => setRange('30days')}
            className={`px-4 py-1.5 rounded-lg transition-all ${range === '30days' ? 'bg-indigo-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            최근 30일
          </button>
          <button
            onClick={() => setRange('all')}
            className={`px-4 py-1.5 rounded-lg transition-all ${range === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'hover:text-white'}`}
          >
            전체 기간
          </button>
        </div>
      </div>

      {/* Loader & State Views */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <span className="text-sm text-white/60 font-bold">통계 데이터를 산출하는 중입니다...</span>
        </div>
      ) : isError ? (
        <div className="py-20 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <p className="text-rose-400 font-bold">서버로부터 분석 지표 데이터를 가져오는 데 실패했습니다.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <AnalyticsSummaryCards summary={summaryQuery.data} />

          {/* Detailed Content Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Route Stats */}
            <div className="lg:col-span-2">
              <RouteAnalyticsTable routes={routesQuery.data} />
            </div>

            {/* Privacy Compliance Banner */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span>개인정보 보장형 실시간 가드</span>
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  크록허브의 웹 분석 텔레메트리는 **"개인정보 보호 중심 설계(Privacy by Design)"**를 기본 준수합니다.
                </p>
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                  서버는 사용자의 IP 주소를 단방향 HMAC 암호화 키를 생성하여 저장하며, 세션 식별 아이디 역시 SHA-256 비가역 키로 안전하게 변형 처리합니다. 원시 로그는 일정 보관 기한이 지나면 영구히 자동 폐기됩니다.
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 text-[10px] text-white/40 leading-relaxed font-semibold">
                <LayoutDashboard className="w-4 h-4 mb-2 text-indigo-400/40" />
                * 수집 대상 원본 원시 데이터는 90일 후 자동 파기되며, 통계 결과만 영구 아카이빙됩니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
