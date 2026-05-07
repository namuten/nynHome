import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePosts } from '../hooks/usePosts';
import { useSchedules } from '../hooks/useSchedules';
import { useSeoMeta } from '../hooks/useSeoMeta';
import PostGrid from '../components/content/PostGrid';
import PullToRefreshContainer from '../components/common/PullToRefreshContainer';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  useSeoMeta('home', 'ko');
  const queryClient = useQueryClient();

  const { data: postsData, isLoading: postsLoading, isError: postsError } = usePosts({ limit: 6 });
  const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  const { data: schedules, isLoading: schedLoading } = useSchedules(currentMonth);

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['posts'] }),
      queryClient.invalidateQueries({ queryKey: ['schedules'] }),
    ]);
  };

  return (
    <PullToRefreshContainer onRefresh={handleRefresh}>
      <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Hero block */}
      <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-tr from-primary/10 via-secondary/5 to-transparent border border-primary/10 p-8 md:p-12 text-center md:text-left croc-scale-bg">
        <div className="max-w-2xl space-y-4">
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider font-display">
            Welcome to CrocHub
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-on-surface tracking-tight">
            Creative, Blog, and Study
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant font-body leading-relaxed">
            아티스틱한 영감을 기록하는 크리에이티브 아카이브이자 성장을 위한 배움의 공간입니다.
          </p>
          <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
            <Link
              to="/gallery"
              className="px-6 py-3 bg-primary text-white font-body font-bold rounded-2xl hover:bg-primary-container hover:text-primary transition duration-300 shadow-md"
            >
              창작 갤러리 탐색
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3 bg-white border border-surface-container text-on-surface-variant font-body font-semibold rounded-2xl hover:bg-surface-container hover:text-primary transition duration-200"
            >
              크리에이터 소개
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Content (Left) + Upcoming Schedules (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Latest Content Section (Col 1-3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-on-surface">최신 기록 피드</h2>
            <Link to="/blog" className="text-sm font-semibold text-primary hover:underline flex items-center space-x-1">
              <span>전체보기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <PostGrid
            posts={postsData?.data}
            isLoading={postsLoading}
            isError={postsError}
            emptyMessage="아직 등록된 최신 기록이 없습니다."
          />
        </div>

        {/* Schedule Sidebar Section (Col 4) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-surface-container pb-4">
            <h2 className="text-xl font-display font-bold text-on-surface flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>이달의 스케줄</span>
            </h2>
          </div>

          {schedLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-surface-container rounded-2xl" />
              ))}
            </div>
          ) : !schedules || schedules.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-surface-container text-xs text-on-surface-variant font-body">
              등록된 이번 달 일정이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((item) => {
                const startDate = new Date(item.startAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-surface-container bg-white shadow-sm hover:shadow-md transition-all duration-200 space-y-2 relative overflow-hidden"
                  >
                    {item.color && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <h4 className="font-display font-bold text-sm text-on-surface line-clamp-1 pl-1">
                      {item.title}
                    </h4>
                    <div className="flex items-center text-[11px] text-on-surface-variant font-body pl-1 space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-container" />
                      <span>{startDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  </PullToRefreshContainer>
);
}
