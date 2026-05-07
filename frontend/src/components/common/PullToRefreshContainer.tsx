import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  onRefresh,
  children,
}) => {
  const { pullOffset, isRefreshing, readyToRefresh } = usePullToRefresh(onRefresh);

  return (
    <div className="relative w-full">
      {/* 당겨서 새로고침 미려한 탑 플로팅 배너 */}
      <div
        className="absolute left-0 right-0 z-30 flex justify-center pointer-events-none transition-transform duration-75"
        style={{
          transform: `translateY(${pullOffset - 48}px)`,
          opacity: pullOffset > 10 ? 1 : 0,
        }}
      >
        <div
          className={`flex items-center justify-center h-10 w-10 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 ${
            readyToRefresh
              ? 'bg-violet-600 border-violet-500 text-white scale-110 shadow-violet-500/25'
              : 'bg-slate-900/90 border-slate-800 text-slate-300'
          }`}
        >
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
          ) : (
            <RefreshCw
              className={`h-4 w-4 transition-transform duration-100 ${
                readyToRefresh ? 'rotate-180 scale-110 text-white' : ''
              }`}
              style={{
                transform: `rotate(${pullOffset * 3}deg)`,
              }}
            />
          )}
        </div>
      </div>

      {/* 실시간 스프링 감속 효과가 입혀진 본문 콘텐트 홀더 */}
      <div
        className="transition-transform duration-100 ease-out"
        style={{
          transform: `translateY(${pullOffset * 0.4}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefreshContainer;
