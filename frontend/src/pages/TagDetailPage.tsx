import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTagBySlug } from '../hooks/useTags';
import { ChevronLeft, Loader2, Tag as TagIcon, Calendar, Compass, FileText, Briefcase } from 'lucide-react';

export const TagDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: tagData, isLoading, isError } = useTagBySlug(slug || '');
  const [activeTab, setActiveTab] = useState<'all' | 'post' | 'portfolio'>('all');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <span>태그에 수록된 고해상도 자산을 파싱 중...</span>
      </div>
    );
  }

  if (isError || !tagData) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <Compass className="w-12 h-12 text-zinc-600 mx-auto animate-spin" />
        <h3 className="text-base font-black text-zinc-200">태그 로드 실패</h3>
        <p className="text-xs text-zinc-500">해당하는 식별 슬러그 태그 자산이 파괴되었거나 만료되었습니다.</p>
        <button
          onClick={() => navigate('/tags')}
          className="px-4 py-2 bg-zinc-900 border border-zinc-850 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-all"
        >
          태그 클라우드로 이동
        </button>
      </div>
    );
  }

  const { tag, contents } = tagData;
  const tagColor = tag.color || '#8b5cf6';

  const posts = contents.posts || [];
  const showcases = contents.showcases || [];

  // 탭 필터링 결과 수집
  const showPosts = activeTab === 'all' || activeTab === 'post';
  const showShowcases = activeTab === 'all' || activeTab === 'portfolio';

  const hasContent = posts.length > 0 || showcases.length > 0;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      {/* 브레드크럼 */}
      <button
        onClick={() => navigate('/tags')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        전체 태그 클라우드로 복귀
      </button>

      {/* 대형 태그 헤더 */}
      <div
        style={{
          borderColor: `${tagColor}26`,
          backgroundColor: `${tagColor}08`,
        }}
        className="p-8 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: `${tagColor}1a`, color: tagColor }}
            className="p-3.5 rounded-2xl border border-zinc-800/10 shrink-0"
          >
            <TagIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-2">
              {tag.name}
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">SLUG: {tag.slug}</p>
          </div>
        </div>

        {/* 심플 카운트 뱃지 */}
        <div className="px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center gap-2.5">
          <span className="text-xs text-zinc-500 font-bold">소속 콘텐츠 합산</span>
          <span
            style={{ color: tagColor }}
            className="text-sm font-mono font-black"
          >
            {posts.length + showcases.length}개
          </span>
        </div>
      </div>

      {/* 탭 컨트롤러 */}
      <div className="flex border-b border-zinc-900 pb-3 justify-between items-center">
        <div className="flex gap-2">
          {(['all', 'post', 'portfolio'] as const).map((tab) => {
            const label = {
              all: '전체 콘텐츠',
              post: '블로그 글',
              portfolio: '쇼케이스',
            }[tab];

            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 콘텐츠 리스트 바디 */}
      {!hasContent ? (
        <div className="text-center py-24 text-xs text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-2xl">
          아직 이 태그에 연결된 콘텐츠 자산이 존재하지 않습니다. 🌱
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. 블로그 아티클 출력 구획 */}
          {showPosts && posts.length > 0 && (
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-xs font-black text-zinc-500 flex items-center gap-1.5 px-1">
                <FileText className="w-4 h-4 text-sky-400" />
                블로그 게시물 ({posts.length})
              </h3>
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <div
                    key={`post_${post.id}`}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="group p-4.5 rounded-xl bg-zinc-900/30 border border-zinc-850 hover:border-zinc-750 transition-all cursor-pointer text-left space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-extrabold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-1.5 py-0.5 rounded">
                        BLOG
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-200 group-hover:text-violet-400 transition-colors line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                      {post.body.replace(/<[^>]*>/g, '').slice(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. 쇼케이스 프로젝트 출력 구획 */}
          {showShowcases && showcases.length > 0 && (
            <div className="space-y-4 md:col-span-1">
              <h3 className="text-xs font-black text-zinc-500 flex items-center gap-1.5 px-1">
                <Briefcase className="w-4 h-4 text-violet-400" />
                쇼케이스 프로젝트 ({showcases.length})
              </h3>
              <div className="flex flex-col gap-3">
                {showcases.map((sc) => (
                  <div
                    key={`showcase_${sc.id}`}
                    onClick={() => navigate(`/portfolio/showcase/${sc.slug}`)}
                    className="group p-4.5 rounded-xl bg-zinc-900/30 border border-zinc-850 hover:border-zinc-750 transition-all cursor-pointer text-left space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-extrabold text-violet-400 uppercase tracking-widest bg-violet-500/10 px-1.5 py-0.5 rounded">
                        SHOWCASE
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {new Date(sc.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-200 group-hover:text-violet-400 transition-colors line-clamp-1">
                      {sc.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                      {sc.description || '프로젝트 기획 상세 내역은 상세 보기에서 확인하세요.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
export default TagDetailPage;
