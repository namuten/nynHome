import React from 'react';
import type { SearchResultItem } from '../../lib/searchApi';
import { BookOpen, Image, Video, Briefcase, ExternalLink } from 'lucide-react';

interface SearchResultCardProps {
  item: SearchResultItem;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ item }) => {
  const { type, title, excerpt, url, thumbnailUrl, createdAt } = item;

  // 타입별 배지 및 아이콘 디자인 조립
  const getTypeBadge = () => {
    switch (type) {
      case 'post':
        return {
          icon: <BookOpen className="w-4 h-4 text-sky-400" />,
          label: '블로그 게시글',
          colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        };
      case 'portfolio':
        return {
          icon: <Briefcase className="w-4 h-4 text-violet-400" />,
          label: '쇼케이스 프로젝트',
          colorClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        };
      case 'image':
        return {
          icon: <Image className="w-4 h-4 text-emerald-400" />,
          label: '이미지 미디어',
          colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'video':
        return {
          icon: <Video className="w-4 h-4 text-amber-400" />,
          label: '동영상 미디어',
          colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
    }
  };

  const badge = getTypeBadge();
  const formattedDate = new Date(createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCardClick = () => {
    window.location.href = url;
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/60 transition-all duration-300 cursor-pointer text-left overflow-hidden shadow-md"
    >
      {/* 썸네일 노출부 (미디어나 쇼케이스 썸네일 존재 시) */}
      {thumbnailUrl ? (
        <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800 relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="hidden sm:flex w-28 h-28 rounded-xl bg-zinc-950 border border-zinc-900 shrink-0 items-center justify-center">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            {badge.icon}
          </div>
        </div>
      )}

      {/* 텍스트 본문 디테일 */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div className="space-y-2">
          {/* 배지 및 날짜 */}
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${badge.colorClass}`}>
              {badge.label}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">{formattedDate}</span>
          </div>

          {/* 제목 */}
          <h3 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-violet-400 transition-colors truncate">
            {title}
          </h3>

          {/* 발췌 내용 요약 */}
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {excerpt || '상세 정보는 상세 페이지에서 확인하실 수 있습니다.'}
          </p>
        </div>

        {/* 연결 링크 버튼 */}
        <div className="flex items-center justify-between mt-3 sm:mt-0 pt-2 border-t border-zinc-800/20 sm:border-t-0">
          <span className="text-[10px] text-zinc-600 font-medium">매치 우선순위 기준 정합성 최적화</span>
          <span className="text-xs font-bold text-zinc-400 group-hover:text-violet-400 flex items-center gap-1 transition-colors">
            상세 보기 <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
export default SearchResultCard;
