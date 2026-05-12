import { useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { usePortfolio } from '../../hooks/usePortfolio';
import { PortfolioHero } from '../../components/portfolio/PortfolioHero';
import { PortfolioSectionRenderer } from '../../components/portfolio/PortfolioSectionRenderer';
import { RefreshCw, Globe, ArrowRight, Grid, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../hooks/useLocale';

export default function PortfolioPage() {
  const { locale, setLocale } = useLocale();

  // 프로필과 포트폴리오를 글로벌 로케일 기저로 로드
  const { profile, locale: profileLocale, changeLocale: changeProfileLocale, loading: profileLoading } = useProfile(locale);
  const { sections, changeLocale: changePortLocale, loading: portLoading } = usePortfolio(locale);

  // 글로벌 로케일과 프로필/포트폴리오 훅의 로컬 상태 싱크
  useEffect(() => {
    changeProfileLocale(locale);
    changePortLocale(locale);
  }, [locale, changeProfileLocale, changePortLocale]);

  const loading = profileLoading || portLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12 font-body">
      {/* 1. 언어 토글러 및 헤더 액션 */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 bg-surface-container/30 border border-surface-container/80 p-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center justify-between xs:justify-start gap-3 w-full xs:w-auto">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Language:</span>
          </div>
          <div className="flex bg-surface-container/80 rounded-full p-0.5 border border-outline-variant/20 shadow-inner">
            <button
              type="button"
              onClick={() => setLocale('ko')}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-full transition-all duration-300 ${
                locale === 'ko'
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              KO
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-full transition-all duration-300 ${
                locale === 'en'
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* 대시보드 바로가기 링크 */}
        <Link
          to="/portfolio/showcase"
          className="flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 rounded-xl text-[11px] font-extrabold text-primary transition-all duration-300 shadow-sm"
        >
          <span>작품 전시관 가기</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 2. 메인 페이지 컨텐츠 */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">포트폴리오 브랜딩 정보를 가져오는 중...</p>
        </div>
      ) : (
        <>
          {/* 히어로 헤더 프로필 */}
          {profile && (
            <PortfolioHero
              displayName={profile.displayName}
              tagline={profile.tagline}
              bio={profile.bio}
              avatarUrl={profile.avatarUrl}
              school={profile.school}
              location={profile.location}
              emailPublic={profile.emailPublic}
              socialLinks={profile.socialLinks}
              locale={profileLocale}
            />
          )}

          {/* 각 포트폴리오 섹션 리스트 렌더링 */}
          <div className="grid grid-cols-1 gap-12 pt-4">
            {sections
              .filter((s) => s.sectionKey !== 'intro') // intro는 히어로에 내장하므로 중복 방지
              .map((section) => (
                <PortfolioSectionRenderer key={section.id} section={section} />
              ))}
          </div>

          {/* 3. 하단 거대 CTA 버튼 조합 */}
          <div className="pt-12 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/portfolio/showcase"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-on-primary text-sm font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-101 active:scale-99 text-center"
            >
              <Grid className="w-4.5 h-4.5" />
              <span>{profileLocale === 'ko' ? '포트폴리오 작품 전시관 관람' : 'Browse Works Showcase'}</span>
            </Link>

            <Link
              to="/portfolio/resume"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-container-high hover:bg-surface-container border border-outline-variant/50 text-on-surface text-sm font-bold rounded-2xl hover:shadow-md transition-all text-center"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>{profileLocale === 'ko' ? '정식 온라인 이력서 인쇄' : 'Print Interactive Resume'}</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
export { PortfolioPage };
