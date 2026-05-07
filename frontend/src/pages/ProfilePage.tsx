import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  Heart,
  Cpu,
  Sparkles,
  MapPin,
  GraduationCap,
  Globe,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { SkillCloud } from '../components/portfolio/SkillCloud';
import { AchievementCards } from '../components/portfolio/AchievementCards';

export default function ProfilePage() {
  const { profile, locale, loading, changeLocale } = useProfile('ko');
  const [activeTab, setActiveTab] = useState<'channels' | 'experience'>('channels');

  // 채널 카드 리스트 구성 (다국어화 대응)
  const getCategories = (isEn: boolean) => [
    {
      title: isEn ? 'Creative Archive' : '크리에이티브 아카이브',
      desc: isEn
        ? 'A Visual archive of illustrations, artworks, and character designs preserving creative inspiration.'
        : '일러스트레이션, 아트워크, 캐릭터 디자인 등 예술적 영감을 시각적 기록으로 남기는 아카이브 채널입니다.',
      link: '/gallery',
      btnText: isEn ? 'Explore Gallery' : '갤러리 둘러보기',
      color: 'border-secondary/20 bg-secondary/5 text-secondary',
      icon: Sparkles,
    },
    {
      title: isEn ? 'Dev & Life Blog' : '개발 및 일상 블로그',
      desc: isEn
        ? 'Reflections on daily life, software development experiences, and thinking processes shared seriously.'
        : '배움과 성찰의 일상, 소프트웨어 지식 개발 경험, 생각의 자취를 진지하게 기록하고 공유합니다.',
      link: '/blog',
      btnText: isEn ? 'Read Blog' : '블로그 읽기',
      color: 'border-primary/20 bg-primary/5 text-primary',
      icon: Heart,
    },
    {
      title: isEn ? 'Study Repository' : '지식 저장소',
      desc: isEn
        ? 'A knowledge sharing space for organizing equations, information theories, and study guides systematically.'
        : '학습 과정에서 터득한 공식, 정보 이론, 요약 가이드 노트를 공들여 체계화하는 지식 공유소입니다.',
      link: '/study',
      btnText: isEn ? 'Explore Studies' : '학습실 탐색',
      color: 'border-emerald-500/20 bg-emerald-50 text-emerald-700',
      icon: Cpu,
    },
  ];

  const categories = getCategories(locale === 'en');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 font-body">
      {/* 1. 커버 배너 및 언어 전환 플로팅 헤더 */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 h-48 md:h-60 border border-outline-variant/30 shadow-inner group">
        {profile?.coverImageUrl ? (
          <img
            src={profile.coverImageUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* 다국어 선택 칩 */}
        <div className="absolute top-4 right-4 bg-white/80 dark:bg-surface-container/80 backdrop-blur-md px-1.5 py-1.5 rounded-2xl flex gap-1 border border-outline-variant/30 shadow-md">
          <button
            onClick={() => changeLocale('ko')}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all duration-300 ${
              locale === 'ko'
                ? 'bg-primary text-on-primary shadow-sm scale-102'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            KO
          </button>
          <button
            onClick={() => changeLocale('en')}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all duration-300 ${
              locale === 'en'
                ? 'bg-primary text-on-primary shadow-sm scale-102'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* 2. 로딩 또는 메인 콘텐츠 레이아웃 */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 -mt-20 md:-mt-24 px-4 relative z-10">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] bg-surface-container-high border-4 border-surface shadow-xl" />
            <div className="flex-1 space-y-3 text-center md:text-left pt-20 md:pt-24">
              <div className="h-6 w-48 bg-surface-container-high rounded-lg mx-auto md:mx-0" />
              <div className="h-4 w-64 bg-surface-container-high rounded-lg mx-auto md:mx-0" />
            </div>
          </div>
          <div className="h-24 bg-surface-container-low rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* 아바타 및 헤더 정보 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 -mt-20 md:-mt-24 px-4 relative z-10">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] object-cover border-4 border-surface shadow-xl hover:rotate-3 transition-transform duration-300"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-4xl sm:text-5xl font-display font-extrabold shadow-xl shrink-0 border-4 border-surface">
                {profile?.displayName?.[0] || 'C'}
              </div>
            )}

            <div className="flex-1 text-center md:text-left space-y-3 pt-4 md:pt-14">
              <div className="space-y-1">
                <h1 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">
                  {profile?.displayName}
                </h1>
                <p className="text-sm font-semibold text-primary font-display tracking-wide">
                  {profile?.tagline || 'Developer & Creative Artist'}
                </p>
              </div>

              {/* 학교, 위치 메타 정보 */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs text-on-surface-variant font-medium pt-1">
                {profile?.school && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary/70" />
                    {profile.school}
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary/70" />
                    {profile.location}
                  </span>
                )}
                {profile?.emailPublic && (
                  <a
                    href={`mailto:${profile.emailPublic}`}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Mail className="w-4 h-4 text-primary/70" />
                    {profile.emailPublic}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 소셜 네트워크 링크 칩셋 */}
          {profile?.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 px-4 pt-1">
              {Object.entries(profile.socialLinks).map(([key, url]) => {
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-outline-variant/30 bg-surface/50 text-xs text-on-surface-variant font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 hover:scale-102 transition-all duration-300 shadow-sm"
                  >
                    {key.toLowerCase() === 'github' ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                        <path d="M9 18c-4.51 2-5-2-7-2" />
                      </svg>
                    ) : key.toLowerCase() === 'blog' ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                    <span className="capitalize">{key}</span>
                  </a>
                );
              })}
            </div>
          )}

          {/* 인트로 자기소개 (Bio) */}
          {profile?.bio && (
            <div className="bg-surface-container/25 dark:bg-surface-container-low/10 border border-outline-variant/20 rounded-3xl p-6 sm:p-8 space-y-3 relative overflow-hidden backdrop-blur-sm shadow-inner">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {locale === 'en' ? 'About Me' : '자기소개'}
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed whitespace-pre-line font-body">
                {profile.bio}
              </p>
            </div>
          )}

          {/* 3. 탭 내비게이션 (채널 & 비전 VS 기술 스택 & 활동 이력) */}
          <div className="border-b border-outline-variant/40 flex justify-center md:justify-start gap-6 pt-4">
            <button
              onClick={() => setActiveTab('channels')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'channels'
                  ? 'text-primary'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4.5 h-4.5" />
                {locale === 'en' ? 'Channels & Vision' : '채널 및 비전'}
              </span>
              {activeTab === 'channels' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`pb-3 text-sm font-bold transition-all relative ${
                activeTab === 'experience'
                  ? 'text-primary'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <Award className="w-4.5 h-4.5" />
                {locale === 'en' ? 'Skills & Achievements' : '기술 스택 및 이력'}
              </span>
              {activeTab === 'experience' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary rounded-full" />
              )}
            </button>
          </div>

          {/* 4. 탭 콘텐츠 영역 */}
          {activeTab === 'channels' ? (
            <div className="space-y-12 animate-fade-in">
              {/* 채널 아카이브 소개 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={i}
                      className="p-6 rounded-3xl border border-outline-variant/30 bg-white dark:bg-surface-container/20 hover:shadow-lg hover:border-primary/20 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between space-y-6"
                    >
                      <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-on-surface">{cat.title}</h3>
                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                      <Link
                        to={cat.link}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-primary hover:underline pt-2 group"
                      >
                        <span>{cat.btnText}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* 비전 및 로드맵 스테이트먼트 */}
              <div className="p-8 rounded-[32px] bg-gradient-to-br from-surface-container/40 to-surface-container/20 border border-outline-variant/30 space-y-4">
                <h3 className="text-lg font-display font-bold text-on-surface flex items-center gap-2">
                  🚀 {locale === 'en' ? 'Future Roadmap & Vision' : '진학 및 프로젝트 로드맵'}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                  {locale === 'en'
                    ? 'CrocHub is evolving beyond a simple archive into an intellectual design tool for systematizing career exploration and academic achievements. In the future, features such as uploading and parsing study PDFs and designing visual documents using interactive canvases will expand progressively.'
                    : 'CrocHub은 단순한 기록실을 넘어 진로 탐색 및 학문적 성과를 체계적으로 분류하는 지적 설계 도구로 진화하고 있습니다. 향후에는 공부한 내용을 정리한 PDF 업로드 및 파싱, 인터랙티브 캔버스를 통한 시각 자료 구성 기능 등이 점진적으로 확장될 예정입니다.'}
                </p>

                {/* 포트폴리오 메인으로 유도하는 CTA */}
                <div className="pt-2">
                  <Link
                    to="/portfolio"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:bg-primary/90 hover:shadow-lg transition-all duration-300 active:scale-98"
                  >
                    <span>{locale === 'en' ? 'View Full Resume & Portfolio' : '포트폴리오 보러가기'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
              {/* 왼쪽 컬럼: 관심사 및 스킬 클라우드 */}
              <div className="md:col-span-1 space-y-6">
                {profile?.interests && profile.interests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-on-surface tracking-wider uppercase">
                      💡 {locale === 'en' ? 'Interests' : '관심 분야'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1.5 bg-surface-container/50 border border-outline-variant/20 rounded-xl text-xs font-semibold text-on-surface-variant"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-on-surface tracking-wider uppercase">
                    🛠️ {locale === 'en' ? 'Key Skills' : '핵심 기술 역량'}
                  </h3>
                  <SkillCloud skills={profile?.skills || []} />
                </div>
              </div>

              {/* 오른쪽 컬럼: 타임라인 활동 이력 */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-on-surface tracking-wider uppercase">
                  🏆 {locale === 'en' ? 'Achievements & Timeline' : '주요 활동 및 수상 이력'}
                </h3>
                <AchievementCards achievements={profile?.achievements || []} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export { ProfilePage };
