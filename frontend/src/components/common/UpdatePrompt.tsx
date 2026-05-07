import React from 'react';
import { useRegisterSWCustom } from '../../hooks/useRegisterSWCustom';

export const UpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSWCustom();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 z-50 max-w-xs sm:max-w-sm rounded-2xl border border-violet-500/20 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur-xl animate-bounce-subtle">
      <div className="mb-3">
        {offlineReady ? (
          <p className="text-xs sm:text-sm font-medium text-slate-200">
            💚 CrocHub가 이제 오프라인 환경에서도 안전하게 작동할 수 있도록 준비되었습니다!
          </p>
        ) : (
          <p className="text-xs sm:text-sm font-medium text-slate-200">
            ⚡ 크록허브의 새로운 기능과 포트폴리오 기획이 업데이트되었습니다. 지금 즉시 적용해 보세요!
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 text-xs">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-lg bg-violet-600 px-3 py-2 font-semibold hover:bg-violet-500 transition-colors cursor-pointer"
          >
            업데이트
          </button>
        )}
        <button
          onClick={close}
          className="rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700 transition-colors cursor-pointer text-slate-300"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
