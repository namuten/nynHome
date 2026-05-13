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
    <div className="space-y-6 font-body select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Operational Telemetry</span>
          </div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
            서비스 방문 통계
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            크록허브 플랫폼의 방문 지표, 인기 유입 경로 및 세션 통계를 실시간 종합 집계합니다.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-container text-white hover:text-primary text-xs font-bold rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>통계 새로고침</span>
        </button>
      </div>

      {/* Date Range Select Area */}
      <div className="bg-white border border-surface-container rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span>집계 기간 범위</span>
        </div>

        <div className="flex bg-surface-container/30 p-1 rounded-xl border border-surface-container text-xs font-bold text-on-surface-variant">
          <button
            onClick={() => setRange('7days')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${range === '7days' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary'}`}
          >
            최근 7일
          </button>
          <button
            onClick={() => setRange('30days')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${range === '30days' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary'}`}
          >
            최근 30일
          </button>
          <button
            onClick={() => setRange('all')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${range === 'all' ? 'bg-primary text-white shadow-sm' : 'hover:text-primary'}`}
          >
            전체 기간
          </button>
        </div>
      </div>

      {/* Loader & State Views */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white border border-surface-container rounded-3xl shadow-sm">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-on-surface-variant font-bold">통계 데이터를 산출하는 중입니다...</span>
        </div>
      ) : isError ? (
        <div className="py-20 text-center bg-red-50 border border-red-200 rounded-3xl shadow-sm">
          <p className="text-red-700 font-bold text-sm">서버로부터 분석 지표 데이터를 가져오는 데 실패했습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <AnalyticsSummaryCards summary={summaryQuery.data} />

          {/* Detailed Content Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Route Stats */}
            <div className="lg:col-span-2">
              <RouteAnalyticsTable routes={routesQuery.data} />
            </div>

            {/* Privacy Compliance Banner */}
            <div className="bg-white border border-surface-container rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span>개인정보 보장형 실시간 가드</span>
                </h3>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed font-bold">
                  크록허브의 웹 분석 텔레메트리는 **"개인정보 보호 중심 설계(Privacy by Design)"**를 기본 준수합니다.
                </p>
                <p className="text-xs text-on-surface-variant/70 leading-relaxed font-semibold">
                  서버는 사용자의 IP 주소를 단방향 HMAC 암호화 키를 생성하여 저장하며, 세션 식별 아이디 역시 SHA-256 비가역 키로 안전하게 변형 처리합니다. 원시 로그는 일정 보관 기한이 지나면 영구히 자동 폐기됩니다.
                </p>
              </div>

              <div className="border-t border-surface-container/60 pt-4 text-[10px] text-on-surface-variant/50 leading-relaxed font-bold">
                <LayoutDashboard className="w-4 h-4 mb-2 text-primary" />
                * 수집 대상 원본 원시 데이터는 90일 후 자동 파기되며, 통계 결과만 영구 아카이빙됩니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
