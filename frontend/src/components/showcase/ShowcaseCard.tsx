import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Tag } from 'lucide-react';
import type { ShowcaseItem } from '../../types/showcase';

interface ShowcaseCardProps {
  item: ShowcaseItem;
}

// 각 고유 제목의 해시 기반으로 유니크하고 영롱한 CSS 그라디언트 생성
const getPremiumGradient = (text: string) => {
  const gradients = [
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-emerald-500 via-teal-600 to-cyan-600',
    'from-amber-500 via-orange-600 to-rose-600',
    'from-blue-600 via-violet-600 to-purple-600',
    'from-fuchsia-600 via-rose-600 to-amber-500',
  ];
  let sum = 0;
  for (let i = 0; i < text.length; i++) {
    sum += text.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

export default function ShowcaseCard({ item }: ShowcaseCardProps) {
  const coverGradient = getPremiumGradient(item.title);

  return (
    <div className="group bg-white dark:bg-surface-container/10 border border-outline-variant/35 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full font-body">
      {/* 1. 상단 대표 그라디언트 빔 / 업로드 커버 미디어 */}
      <div className="relative h-44 w-full overflow-hidden shrink-0 bg-surface-container-low border-b border-outline-variant/10">
        {item.coverMedia?.fileUrl ? (
          item.coverMedia.mimeType.startsWith('video/') ? (
            <div className="w-full h-full relative">
              <video
                src={item.coverMedia.fileUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                muted
                playsInline
                loop
                autoPlay
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center select-none">
                <span className="bg-black/55 backdrop-blur-md text-[9px] font-black text-white px-2 py-1 rounded-lg">
                  ▶ VIDEO DEMO
                </span>
              </div>
            </div>
          ) : (
            <img
              src={item.coverMedia.fileUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-tr ${coverGradient} group-hover:scale-105 transition-transform duration-500 flex items-center justify-center p-6 text-center select-none`}>
            {/* 장식용 화려한 광륜 */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            <div className="absolute -inset-10 bg-radial-gradient from-white/20 to-transparent opacity-40 blur-xl pointer-events-none" />
            
            <h4 className="text-white text-xs font-black tracking-tight drop-shadow-md">
              {item.title}
            </h4>
          </div>
        )}

        {/* 카테고리 배지 */}
        <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 bg-black/40 backdrop-blur-md text-[10px] font-extrabold text-white rounded-full uppercase tracking-wider select-none">
          <Bookmark className="w-3 h-3 text-primary-container" />
          <span>{item.category}</span>
        </span>

        {/* Featured 배지 */}
        {item.isFeatured && (
          <span className="absolute top-4 right-4 inline-flex items-center gap-0.5 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full shadow-sm select-none">
            ⭐ BEST
          </span>
        )}
      </div>

      {/* 2. 카드 바디 */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-black text-on-surface group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-[11px] text-on-surface-variant/85 font-medium leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* 메타데이터 */}
        <div className="space-y-3 pt-2">
          {/* 태그 리스트 */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-surface-container/40 border border-outline-variant/15 text-[9px] font-bold text-on-surface-variant/80 rounded"
                >
                  <Tag className="w-2.5 h-2.5" />
                  <span>{tag}</span>
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-[9px] font-bold text-on-surface-variant/50 self-center px-1">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 하단 구분선 및 상세 이동 */}
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-[10px] font-bold text-on-surface-variant">
            <span>
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                  })
                : '최근 등록'}
            </span>

            <Link
              to={`/portfolio/showcase/${item.slug}`}
              className="inline-flex items-center gap-1 text-primary hover:underline group/btn font-extrabold"
            >
              <span>자세히 보기</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export { ShowcaseCard };
