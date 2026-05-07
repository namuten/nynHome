import { useState, useEffect } from 'react';
import { RefreshCw, Layout, FileText, User, Briefcase, Palette, GraduationCap, Sparkles } from 'lucide-react';
import { getSeoSettings, updateSeoSettings } from '../../lib/seo';
import { LocaleTabs } from '../../components/admin/LocaleTabs';
import SeoSettingsForm from '../../components/admin/SeoSettingsForm';
import type { LocaleCode } from '../../types/profile';
import type { SeoSettings } from '../../types/seo';

// 관리 가능한 고정 라우트 키 목록 선언
const ROUTE_KEYS = [
  { key: 'home', label: '메인 홈', icon: Layout },
  { key: 'profile', label: '자기소개', icon: User },
  { key: 'portfolio', label: '포트폴리오 대시보드', icon: Briefcase },
  { key: 'resume', label: '경력 이력서', icon: GraduationCap },
  { key: 'showcase', label: '작품 쇼케이스 목록', icon: Palette },
  { key: 'blog', label: '개발 블로그', icon: FileText },
];

export default function AdminSeoPage() {
  const [routeKey, setRouteKey] = useState('home');
  const [locale, setLocale] = useState<LocaleCode>('ko');
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeoData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSeoSettings(routeKey, locale);
        setSettings(res);
      } catch (err: any) {
        console.error(err);
        setError('해당 라우트의 SEO 구성을 서버에서 가동하지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeoData();
  }, [routeKey, locale]);

  const handleSaveSeo = async (data: Partial<SeoSettings>) => {
    try {
      const res = await updateSeoSettings(routeKey, data);
      setSettings(res);
    } catch (err) {
      console.error(err);
      throw err; // Form 내부에서 에러 피드백을 처리하도록 전파
    }
  };

  return (
    <div className="space-y-6 max-w-5xl font-body">
      {/* 1. 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">🔍 글로벌 SEO & Open Graph 설정</h1>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          구글/네이버 검색 로봇 유입율을 높이고, SNS 링크 공유 시 유려하고 독보적인 크리에이터 카드를 상영할 수 있게 각 라우트별 검색 최적화 값을 설정합니다.
        </p>
      </div>

      {/* 2. 라우트 키 선택 카드 칩 */}
      <div className="bg-white/80 border border-outline-variant/35 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span>최적화 대상 페이지 선택 (Target Page)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {ROUTE_KEYS.map((route) => {
            const Icon = route.icon;
            const isSelected = route.key === routeKey;
            return (
              <button
                key={route.key}
                type="button"
                onClick={() => setRouteKey(route.key)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-primary/5 border-primary text-primary font-black shadow-inner scale-[1.02]'
                    : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60 hover:text-on-surface hover:bg-surface-container/10'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 mb-2 ${isSelected ? 'text-primary' : 'text-on-surface-variant/75'}`} />
                <span className="text-[10px] font-bold truncate tracking-tight">{route.label}</span>
                <span className="font-mono text-[8px] opacity-60 mt-0.5">/{route.key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 로케일 탭 전환 */}
      <LocaleTabs activeLocale={locale} onChange={setLocale} />

      {/* 4. 본체 편집 폼 및 미리보기 영역 */}
      {loading ? (
        <div className="bg-white/90 border border-outline-variant/30 rounded-3xl p-16 flex flex-col items-center justify-center space-y-4 shadow-sm">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">실시간 메타 설정을 동기화하고 있습니다...</p>
        </div>
      ) : error || !settings ? (
        <div className="bg-white/90 border border-outline-variant/30 rounded-3xl p-16 text-center text-red-600 text-xs font-semibold">
          ⚠️ {error || '데이터 동기화 실패'}
        </div>
      ) : (
        <SeoSettingsForm
          routeKey={routeKey}
          initialValues={settings}
          onSubmit={handleSaveSeo}
        />
      )}
    </div>
  );
}
export { AdminSeoPage };
