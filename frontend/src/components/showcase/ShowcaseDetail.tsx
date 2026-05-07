import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Tag, Calendar, ExternalLink, Bookmark, Newspaper, Grid } from 'lucide-react';
import { GallerySlideshow } from './GallerySlideshow';
import type { ShowcaseItem } from '../../types/showcase';

interface ShowcaseDetailProps {
  item: ShowcaseItem;
  locale: 'ko' | 'en';
}

// 작품 고유 ID별로 매칭하여 상세 스크린샷 갤러리 가상 이미지 구성 (풍성한 데모 시각화 제공)
const getFallbackGalleryImages = (id: number): string[] => {
  const galleries: Record<number, string[]> = {
    [-1]: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543286386-7a395010dfec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    ],
    [-2]: [
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    ],
    [-3]: [
      'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1680814907495-e29113f98224?auto=format&fit=crop&w=1200&q=80',
    ],
  };

  // 기본 반환값: 기하학 구조 가상 테크 디자인
  return galleries[id] || [
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  ];
};

export default function ShowcaseDetail({ item, locale }: ShowcaseDetailProps) {
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

  // 미디어 파일 또는 Fallback 갤러리 이미지 할당
  const galleryImages = getFallbackGalleryImages(item.id);

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-body animate-fade-in">
      {/* 1. 이력서 상단 조작바 */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 print:hidden">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'ko' ? '작품 목록으로 돌아가기' : 'Back to Works'}</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-[10px] font-black text-on-surface-variant rounded-full">
          <Bookmark className="w-3.5 h-3.5 text-primary" />
          <span>{item.category}</span>
        </span>
      </div>

      {/* 2. 메인 헤더 레이아웃 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                  })
                : '2026년 05월'}
            </span>
          </div>
          {item.isFeatured && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-extrabold text-[9px]">
              ⭐ FEATURED WORK
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3.5xl font-display font-black text-on-surface leading-tight tracking-tight">
          {item.title}
        </h1>

        {/* 태그 리스트 */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 bg-surface-container/60 border border-outline-variant/20 text-xs font-extrabold text-on-surface-variant rounded-lg shadow-sm"
              >
                <Tag className="w-3 h-3 text-primary/80" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. 대표 비주얼 이미지 대형 배너 */}
      <div className="relative rounded-3xl overflow-hidden shadow-md h-72 sm:h-96 w-full select-none">
        <img
          src={galleryImages[0]}
          alt={`${item.title} 커버`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 4. 프로젝트 상세 설명 */}
      <div className="bg-white/80 dark:bg-surface-container/10 border border-outline-variant/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-primary border-b border-outline-variant/20 pb-2 uppercase tracking-wider">
          📋 프로젝트 소개 (Project Context)
        </h3>
        <p className="text-sm font-medium text-on-surface-variant leading-relaxed whitespace-pre-line">
          {item.description}
        </p>
      </div>

      {/* 5. 미디어 상세 이력 갤러리 모음 */}
      {galleryImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-wider">
            <Grid className="w-4.5 h-4.5" />
            작품 시각 자료 및 스크린샷 (Gallery Assets)
          </h3>
          <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
            클릭 시 고해상도 전체 화면 라이트박스 뷰어 슬라이드가 상영됩니다. (좌우 키보드 및 ESC 키 지원)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryImages.map((imgUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSlideshowIndex(index)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] w-full border border-outline-variant/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <img
                  src={imgUrl}
                  alt={`프로젝트 스크린샷 ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. 연결된 개발 블로그 포스트 연계 CTA (브랜드 가치 폭발) */}
      {item.postId && (
        <div className="bg-gradient-to-tr from-primary/10 via-purple-500/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="space-y-1.5 flex-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-md">
              <Newspaper className="w-3.5 h-3.5" />
              <span>연관 기술 아티클</span>
            </span>
            <h4 className="text-sm font-black text-on-surface">
              {locale === 'ko' ? '📚 이 작품의 핵심 개발 일지 및 아키텍처 아티클 읽기' : '📚 Read Engineering DevLog & Technical Deep-Dive'}
            </h4>
            <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
              {locale === 'ko'
                ? '개발 과정에서 직면했던 기술 장벽들, 구조 디자인 결정, 문제 해결 과정을 담은 상세 포스트로 연결됩니다.'
                : 'Click to explore the software architecture paradigms, core performance hurdles, and key design decisions recorded in detail.'}
            </p>
          </div>

          <Link
            to={`/post/${item.postId}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary/95 transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-98"
          >
            <span>블로그 아티클로 이동</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 7. 라이트박스 갤러리 슬라이드쇼 바인딩 */}
      {slideshowIndex !== null && (
        <GallerySlideshow
          mediaUrls={galleryImages}
          currentIndex={slideshowIndex}
          onIndexChange={setSlideshowIndex}
          onClose={() => setSlideshowIndex(null)}
        />
      )}
    </div>
  );
}
export { ShowcaseDetail };
