import { useProfile } from '../../hooks/useProfile';
import { usePortfolio } from '../../hooks/usePortfolio';
import { RefreshCw, Printer, Mail, MapPin, GraduationCap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResumePage() {
  const { profile, locale: profileLocale, changeLocale: changeProfileLocale, loading: profileLoading } = useProfile('ko');
  const { sections, changeLocale: changePortLocale, loading: portLoading } = usePortfolio('ko');

  const handleLocaleChange = (targetLocale: 'ko' | 'en') => {
    changeProfileLocale(targetLocale);
    changePortLocale(targetLocale);
  };

  const loading = profileLoading || portLoading;

  // 인쇄 함수 실행
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 font-body">
      {/* 1. 컨트롤 패널 (화면에만 출력, 인쇄 시 자동 배제) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden bg-surface-container/30 border border-outline-variant/30 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="p-2 border border-outline-variant/40 rounded-xl hover:bg-surface-container transition-all"
            title="포트폴리오 돌아가기"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant/30 text-xs">
            <button
              type="button"
              onClick={() => handleLocaleChange('ko')}
              className={`px-3 py-1 font-bold rounded-md transition-all ${
                profileLocale === 'ko' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              한국어 이력서
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange('en')}
              className={`px-3 py-1 font-bold rounded-md transition-all ${
                profileLocale === 'en' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              English CV
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl hover:shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>{profileLocale === 'ko' ? 'PDF 파일로 인쇄 / 다운로드' : 'Print / Save as PDF'}</span>
        </button>
      </div>

      {/* 2. 실제 이력서 내용 (인쇄 대응 가능한 세련되고 깔끔한 A4 규격 지향) */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4 print:hidden">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-on-surface-variant font-medium">이력 정보를 정리하는 중...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-transparent rounded-3xl border border-outline-variant/30 p-8 sm:p-12 shadow-sm print:shadow-none print:border-none space-y-10">
          {/* A. 이력서 헤더 인적정보 */}
          {profile && (
            <div className="border-b-2 border-primary/20 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-black text-on-surface tracking-tight">{profile.displayName}</h1>
                {profile.tagline && <p className="text-sm font-bold text-primary">{profile.tagline}</p>}
                {profile.bio && <p className="text-xs text-on-surface-variant leading-relaxed max-w-xl font-medium pt-1">{profile.bio}</p>}
              </div>

              {/* 기본 정보 */}
              <div className="space-y-1.5 text-xs text-on-surface-variant/90 font-semibold self-start shrink-0">
                {profile.emailPublic && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{profile.emailPublic}</span>
                  </div>
                )}
                {profile.school && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                    <span>{profile.school}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* B. 섹션별 상세 이력 루프 */}
          <div className="space-y-8">
            {sections
              .filter((s) => s.sectionKey !== 'intro') // intro는 상단 헤더에 포함
              .map((section) => (
                <div key={section.id} className="space-y-3.5 break-inside-avoid">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant/40 pb-1.5">
                    <span>{section.title}</span>
                  </h3>

                  {section.body && (
                    <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line font-medium bg-surface-container/10 p-3.5 rounded-xl border border-outline-variant/15">
                      {section.body}
                    </p>
                  )}

                  {/* 세부 아이템 리스트 */}
                  {section.items && section.items.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                      {section.items.map((item, index) => (
                        <div key={index} className="pl-4 border-l-2 border-primary/20 space-y-1 relative">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-on-surface">{item.title}</h4>
                            {item.date && <span className="text-[10px] font-bold text-on-surface-variant/80">{item.date}</span>}
                          </div>
                          {item.subtitle && <p className="text-[11px] font-bold text-on-surface-variant">{item.subtitle}</p>}
                          {item.description && <p className="text-[11px] text-on-surface-variant/90 whitespace-pre-line leading-relaxed font-medium">{item.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* C. 푸터 정보 */}
          <div className="border-t border-outline-variant/30 pt-6 text-center text-[10px] text-on-surface-variant/50 font-bold">
            <span>본 이력서는 {new Date().toLocaleDateString()} 기준 최신 정보로 갱신되었습니다.</span>
          </div>
        </div>
      )}
    </div>
  );
}
export { ResumePage };
