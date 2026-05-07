import { BarChart3, TrendingUp, Users, Eye, RefreshCw, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const mockMetrics = [
    { title: '오늘의 페이지 뷰 (Page Views)', value: '1,284', change: '+12.4%', up: true, desc: '어제 동일 시간 대비', icon: Eye },
    { title: '오늘의 활성 세션 (Active Sessions)', value: '342', change: '+8.2%', up: true, desc: '실시간 활동 유저 포함', icon: Users },
    { title: '평균 체류 시간 (Session Duration)', value: '4m 32s', change: '-2.1%', up: false, desc: '상세 가이드 플레이 효과', icon: TrendingUp },
  ];

  const mockRoutes = [
    { route: '/', views: 580, unique: 240, percent: '45%' },
    { route: '/portfolio', views: 320, unique: 180, percent: '25%' },
    { route: '/portfolio/showcase/crochub-dashboard', views: 210, unique: 110, percent: '16%' },
    { route: '/portfolio/resume', views: 110, unique: 80, percent: '8%' },
    { route: '/blog', views: 64, unique: 45, percent: '6%' },
  ];

  return (
    <div className="space-y-8 font-body select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-container pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Operational Telemetry</span>
          </div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">
            서비스 방문 통계
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            크록허브 플랫폼의 방문 지표, 인기 유입 경로 및 다국어별 선호도를 실시간 종합 집계합니다.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>통계 새로고침</span>
        </button>
      </div>

      {/* Grid: Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white/80 border border-surface-container/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-on-surface-variant leading-none">{m.title}</span>
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-display font-black text-on-surface">{m.value}</span>
                <span className={`inline-flex items-center text-xs font-extrabold gap-0.5 ${m.up ? 'text-green-600' : 'text-red-500'}`}>
                  {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {m.change}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-on-surface-variant font-medium">
                {m.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Route Analytics */}
        <div className="bg-white/80 border border-surface-container/60 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>실시간 인기 유입 경로</span>
            </h3>
            <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-1 rounded-md">Page Views</span>
          </div>

          <div className="divide-y divide-surface-container">
            {mockRoutes.map((r, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                <div className="font-mono text-on-surface-variant truncate max-w-[200px] sm:max-w-xs">{r.route}</div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-on-surface">{r.views} PV</div>
                    <div className="text-[10px] text-on-surface-variant font-medium">{r.unique} UV</div>
                  </div>
                  <div className="w-12 text-right font-black text-primary">{r.percent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informative Dashboard Guide */}
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <span>💡 개인정보 최소 수집 분석 시스템</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              크록허브의 모든 원시 분석(Analytics Raw Log)은 **개인정보 침해 방지를 기본값(Privacy by Design)**으로 구현되어 있습니다. 
              유저의 오리지널 IP 주소는 메모리 상에서 암호학적 Salt Hash 처리를 거친 무작위 키값으로만 기록되며, 브라우저 User-Agent 데이터는 제조사 및 기기 종류 기준의 안전 규격 정보로 축약 가공됩니다.
            </p>
          </div>
          <div className="mt-6 border-t border-primary/10 pt-4 text-[11px] text-primary/70 font-bold leading-relaxed">
            * 수집 대상 원본 원시 데이터는 90일 후 자동 파기되며, 보관 일지별 통계 결과만 영구 아카이빙됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
