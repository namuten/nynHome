import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt';
import { Download, Share, X, Sparkles } from 'lucide-react';

export default function PwaInstallBanner() {
  const { isInstallable, showBanner, isIOS, installApp, dismissBanner } = usePwaInstallPrompt();

  if (!isInstallable || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-fade-in-up">
      <div className="relative overflow-hidden rounded-2xl border border-surface-container/60 bg-surface/80 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300">
        
        {/* Glow decoration */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={dismissBanner}
          className="absolute top-3 right-3 p-1 rounded-full border border-surface-container bg-surface/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          {/* Logo / Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white font-black text-lg flex items-center justify-center shadow-lg shadow-primary/25 shrink-0 select-none">
            CH
          </div>

          <div className="flex-1 space-y-1.5 pr-4">
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-1.5 leading-tight">
              <span>CrocHub 앱 설치하기</span>
              <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
            </h4>
            <p className="text-[11px] text-on-surface-variant/90 leading-relaxed font-medium">
              {isIOS ? (
                <span>CrocHub를 홈 화면에 추가하여 앱처럼 오프라인에서도 끊김 없이 자유롭게 감상해 보세요!</span>
              ) : (
                <span>설치 한 번으로 끊김 없고 부드러운 오프라인 이용과 홈 화면 간편 이동을 지원합니다.</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-surface-container/60 flex items-center justify-between gap-3">
          <button
            onClick={dismissBanner}
            className="text-[11px] font-bold text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl transition"
          >
            나중에 하기
          </button>

          {isIOS ? (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-secondary/5 border border-secondary/20 text-secondary rounded-xl text-[10px] font-bold select-none animate-pulse">
              <Share className="w-3.5 h-3.5" />
              <span>[공유] ➔ [홈 화면에 추가] 클릭</span>
            </div>
          ) : (
            <button
              onClick={installApp}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md shadow-primary/15 transition-all duration-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>앱으로 빠른 감상</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
