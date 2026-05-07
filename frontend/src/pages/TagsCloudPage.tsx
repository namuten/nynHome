import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTags } from '../hooks/useTags';
import { Hash, Loader2, Compass, Tag as TagIcon, LayoutGrid } from 'lucide-react';

export const TagsCloudPage: React.FC = () => {
  const { data: tags, isLoading, isError } = useTags();
  const navigate = useNavigate();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 flex items-center gap-2.5">
          <Hash className="w-8 h-8 text-violet-500 animate-pulse" />
          테마 태그 클라우드
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          크록허브의 블로그 게시글과 작품 포트폴리오를 구성하고 있는 다채로운 메타 테마 분류망을 한눈에 탐색합니다.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <span className="text-xs">데이터베이스의 지식 태그를 불러모으는 중...</span>
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-center text-red-400 text-xs">
          태그 정보를 로드하는 도중 데이터 통신에 문제가 생겼습니다.
        </div>
      ) : !tags || tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
          <Compass className="w-8 h-8 text-zinc-700" />
          <span className="text-xs">등록된 카테고리 태그 정보가 없습니다 🌱</span>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-zinc-900/20 border border-zinc-850 flex flex-wrap gap-4 items-center justify-center min-h-[250px]">
          {tags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => navigate(`/tags/${tag.slug}`)}
              style={{
                borderColor: `${tag.color || '#8b5cf6'}33`,
                backgroundColor: `${tag.color || '#8b5cf6'}0d`,
              }}
              className="group flex items-center gap-2 px-5 py-3 rounded-2xl border hover:border-violet-500 hover:bg-zinc-900/40 transition-all duration-300 cursor-pointer shadow-sm active:scale-95 hover:scale-[1.04]"
            >
              <TagIcon
                className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12"
                style={{ color: tag.color || '#8b5cf6' }}
              />
              <span className="text-sm font-black text-zinc-200 group-hover:text-white transition-colors">
                {tag.name}
              </span>
              <span
                style={{
                  backgroundColor: `${tag.color || '#8b5cf6'}26`,
                  color: tag.color || '#8b5cf6',
                }}
                className="px-2 py-0.5 text-[10px] rounded-md font-mono font-extrabold"
              >
                {tag.contentCount || 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 안내 박스 */}
      <div className="flex items-center gap-2.5 p-4.5 rounded-xl bg-zinc-900/30 border border-zinc-850">
        <LayoutGrid className="w-5 h-5 text-zinc-500 shrink-0" />
        <span className="text-xs text-zinc-500 font-medium leading-relaxed">
          💡 각 키워드를 클릭하시면 해당 태그가 지정되어 있는 블로그 아티클과 개인 포트폴리오 쇼케이스의 목록을 역색인하여 시간 역순으로 일목요연하게 만나실 수 있습니다.
        </span>
      </div>
    </main>
  );
};
export default TagsCloudPage;
