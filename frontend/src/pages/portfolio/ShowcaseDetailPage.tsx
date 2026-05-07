import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RefreshCw, ArrowLeft, HeartCrack } from 'lucide-react';
import { useShowcaseDetail } from '../../hooks/useShowcase';
import { ShowcaseDetail } from '../../components/showcase/ShowcaseDetail';
import type { LocaleCode } from '../../types/profile';

export default function ShowcaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [locale, setLocale] = useState<LocaleCode>('ko');

  // 슬러그 기준 상세 리스트 가져오기 (다국어 매칭 적용)
  const { item, loading, error, refetch } = useShowcaseDetail(slug, locale);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 font-body select-none">
      {/* 1. 로딩 본문 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-36 space-y-4">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <p className="text-xs sm:text-sm font-bold text-on-surface-variant leading-relaxed">
            작품 상세 리포트를 실시간 분석하고 있습니다...
          </p>
        </div>
      ) : error || !item ? (
        /* 2. 에러 및 미발견 피드백 */
        <div className="bg-white/80 border border-outline-variant/30 rounded-3xl p-16 text-center space-y-6 max-w-lg mx-auto shadow-sm animate-fade-in">
          <HeartCrack className="w-14 h-14 text-red-500/80 mx-auto animate-pulse" />
          
          <div className="space-y-2">
            <h2 className="text-lg font-black text-on-surface">작품을 찾을 수 없습니다</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              요청하신 주소의 쇼케이스 작품이 존재하지 않거나, 아직 어드민에 의해 비공개 처리된 프로젝트 상태일 수 있습니다.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={refetch}
              className="px-5 py-2 border border-outline-variant/40 hover:bg-surface-container rounded-xl text-xs font-bold transition-all bg-white"
            >
              새로고침
            </button>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1 px-5 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary/95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>포트폴리오 홈</span>
            </Link>
          </div>
        </div>
      ) : (
        /* 3. 본체 로드 성공 */
        <div className="space-y-4">
          {/* 간이 로케일 토글 조작바 (상세 보기 우측 정렬) */}
          <div className="flex justify-end pt-1 print:hidden">
            <div className="flex bg-surface-container/50 border border-outline-variant/20 p-0.5 rounded-lg gap-0.5">
              <button
                type="button"
                onClick={() => setLocale('ko')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
                  locale === 'ko' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                KO
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
                  locale === 'en' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* 세부 상세 렌더러 마운트 */}
          <ShowcaseDetail item={item} locale={locale} />
        </div>
      )}
    </div>
  );
}
export { ShowcaseDetailPage };
