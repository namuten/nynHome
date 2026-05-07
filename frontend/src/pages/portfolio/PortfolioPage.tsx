import { useProfile } from '../../hooks/useProfile';
import { usePortfolio } from '../../hooks/usePortfolio';
import { PortfolioHero } from '../../components/portfolio/PortfolioHero';
import { PortfolioSectionRenderer } from '../../components/portfolio/PortfolioSectionRenderer';
import { RefreshCw, Globe, ArrowRight, Grid, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PortfolioPage() {
  // 프로필과 포트폴리오를 'ko' (한국어) 기본값으로 로드
  const { profile, locale: profileLocale, changeLocale: changeProfileLocale, loading: profileLoading } = useProfile('ko');
  const { sections, changeLocale: changePortLocale, loading: portLoading } = usePortfolio('ko');

  // 다국어 토글 연계
  const handleLocaleChange = (targetLocale: 'ko' | 'en') => {
    changeProfileLocale(targetLocale);
    changePortLocale(targetLocale);
  };

  const loading = profileLoading || portLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-12 font-body">
      {/* 1. 언어 토글러 및 헤더 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Language Settings:</span>
          <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => handleLocaleChange('ko')}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition-all ${
                profileLocale === 'ko'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange('en')}
              className={`px-3 py-1 text-[10px] font-extrabold rounded-md transition-all ${
                profileLocale === 'en'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              ENGLISH
            </button>
          </div>
        </div>

        {/* 대시보드 바로가기 링크 (개발자 편의) */}
        <Link
          to="/showcase"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span>작품 전시관 가기</span>
          <ArrowRight className="w-3.5 h-3.5" />
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
              to="/showcase"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-on-primary text-sm font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-101 active:scale-99 text-center"
            >
              <Grid className="w-4.5 h-4.5" />
              <span>{profileLocale === 'ko' ? '포트폴리오 작품 전시관 관람' : 'Browse Works Showcase'}</span>
            </Link>

            <Link
              to="/resume"
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
