import React from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export const OfflinePage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* 프리미엄 네온 글로우 스타일 아이콘 컨테이너 */}
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-2 ring-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-pulse">
        <WifiOff className="h-12 w-12" />
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-red-500 text-[10px] font-bold">
          !
        </div>
      </div>

      <h1 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        인터넷 연결이 원활하지 않습니다
      </h1>
      
      <p className="mx-auto mb-8 max-w-md text-sm text-slate-400 sm:text-base leading-relaxed">
        현재 네트워크 연결이 끊어져 있어 CrocHub를 정상적으로 동기화할 수 없습니다. 
        하지만 이전에 방문하신 아티클과 포트폴리오는 캐시를 통해 열람하실 수 있습니다.
      </p>

      {/* 인터랙티브 제어 버튼 세트 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-md">
        <button
          onClick={handleReload}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 animate-spin-slow" />
          다시 연결 시도
        </button>

        <button
          onClick={handleGoHome}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          <Home className="h-4 w-4" />
          저장된 메인 홈으로
        </button>
      </div>

      {/* 하단 악어 귀여운 마크 테마 장식 */}
      <div className="mt-16 text-xs text-slate-500 select-none">
        🐊 CrocHub Offline Resilience Core v1.1
      </div>
    </div>
  );
};

export default OfflinePage;
