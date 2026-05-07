import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, RefreshCw, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { useShowcaseList } from '../../hooks/useShowcase';
import { ShowcaseGrid } from '../../components/showcase/ShowcaseGrid';
import type { LocaleCode } from '../../types/profile';

export default function ShowcasePage() {
  const [locale, setLocale] = useState<LocaleCode>('ko');

  // 쇼케이스 프로젝트 전체 리스트 가져오기 (다국어 연동)
  const { items, loading, error, refetch } = useShowcaseList(locale);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-12 font-body select-none">
      {/* 1. 상단 브레드크럼 조작 단체 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div className="space-y-1">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'ko' ? '메인 포트폴리오로 돌아가기' : 'Back to Portfolio'}</span>
          </Link>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-8 h-8 text-primary" />
            <span>{locale === 'ko' ? '🎨 쇼케이스 아카이브' : '🎨 Creative Showcase'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {locale === 'ko'
              ? '직접 설계하고 배포한 고도화 시스템, 오픈소스 실험실, 3D 가상 공간 렌더링 등 기술 결과물 모음집입니다.'
              : 'A curated collection of production systems, 3D WebGL environments, and autonomous agentic AI experiments.'}
          </p>
        </div>

        {/* 내비게이션 바로가기 */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Link
            to="/portfolio/resume"
            className="inline-flex items-center gap-1 px-4 py-2 bg-surface-container-high hover:bg-surface-container border border-outline-variant/30 text-xs font-bold text-on-surface rounded-xl hover:shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>{locale === 'ko' ? '정식 이력서' : 'View Resume'}</span>
          </Link>

          {/* 로케일 수동 전환 버튼 칩 */}
          <div className="flex bg-surface-container-high/60 border border-outline-variant/25 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setLocale('ko')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                locale === 'ko' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              KO
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                locale === 'en' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* 2. 에러 알림 패널 */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-50 text-red-800 border border-red-200 rounded-2xl max-w-lg mx-auto text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="underline hover:text-red-950 font-black ml-4 shrink-0"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 3. 본체 로딩 / 그리드 상영 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs sm:text-sm font-bold text-on-surface-variant leading-relaxed">
            {locale === 'ko' ? '쇼케이스 프로젝트 목록을 불러오는 중입니다...' : 'Loading showcase archive...'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <ShowcaseGrid items={items} locale={locale} />
        </div>
      )}
    </div>
  );
}
export { ShowcasePage };
