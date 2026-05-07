import { Sparkles, ArrowRight, Globe, ExternalLink, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PortfolioHeroProps {
  displayName: string;
  tagline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  school?: string | null;
  location?: string | null;
  emailPublic?: string | null;
  socialLinks?: Record<string, string>;
  locale: 'ko' | 'en';
}

export default function PortfolioHero({
  displayName,
  tagline,
  bio,
  avatarUrl,
  school,
  location,
  emailPublic,
  socialLinks = {},
  locale,
}: PortfolioHeroProps) {
  // 소셜 키와 아이콘 매핑
  const renderSocialIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('github') || k.includes('git')) return <Globe className="w-5 h-5" />;
    if (k.includes('email') || k.includes('mail')) return <Mail className="w-5 h-5" />;
    return <ExternalLink className="w-4 h-4" />;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-primary/10 via-accent/5 to-white dark:from-primary/20 dark:via-surface/10 dark:to-surface border border-outline-variant/30 p-8 sm:p-12 shadow-sm font-body">
      {/* 백그라운드 구체 그래픽 */}
      <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -top-12 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl -z-10 animate-pulse" style={{ animationDuration: '9s' }} />

      <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12 relative z-10">
        {/* 아바타 영역 */}
        <div className="relative shrink-0 group">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary via-accent to-secondary rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500" />
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-surface-container bg-surface-container-high shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                {displayName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* 텍스트 영역 */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-fade-in uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" style={{ animationDuration: '4s' }} />
            <span>Creative Branding Portfolio</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-on-surface tracking-tight leading-tight">
            {displayName}
          </h1>

          {tagline && (
            <p className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent leading-relaxed">
              {tagline}
            </p>
          )}

          {bio && (
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
              {bio}
            </p>
          )}

          {/* 소속 / 위치 태그들 */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 text-xs text-on-surface-variant/80 font-bold">
            {school && <span className="px-3 py-1 bg-surface-container-high rounded-lg border border-outline-variant/30">🎓 {school}</span>}
            {location && <span className="px-3 py-1 bg-surface-container-high rounded-lg border border-outline-variant/30">📍 {location}</span>}
          </div>

          {/* 소셜 채널 및 CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
            <div className="flex items-center gap-2">
              {emailPublic && (
                <a
                  href={`mailto:${emailPublic}`}
                  className="p-2.5 bg-white dark:bg-surface border border-outline-variant/40 rounded-xl hover:text-primary hover:border-primary hover:shadow-md transition-all text-on-surface-variant"
                  title="이메일 보내기"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {Object.entries(socialLinks).map(([key, value]) => (
                <a
                  key={key}
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white dark:bg-surface border border-outline-variant/40 rounded-xl hover:text-primary hover:border-primary hover:shadow-md transition-all text-on-surface-variant flex items-center gap-1.5"
                  title={key}
                >
                  {renderSocialIcon(key)}
                </a>
              ))}
            </div>

            {/* 이력서 상세 CTA */}
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded-xl hover:shadow-lg transition-all active:scale-98 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>{locale === 'ko' ? '상세 이력서 보기' : 'View Full Resume'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export { PortfolioHero };
