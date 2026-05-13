import { usePushPermission } from '../../hooks/usePushPermission';
import { Bell, X, Sparkles } from 'lucide-react';

export default function PushPermissionBanner() {
  const { isSupported, permission, showBanner, isPending, subscribePush, dismissBanner } = usePushPermission();

  // 브라우저가 지원하지 않거나, 이미 승인/거절되었거나, 배너 노출이 꺼진 경우 숨김
  if (!isSupported || permission !== 'default' || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md animate-fade-in-up">
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-surface/80 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300">
        
        {/* Glow styling decor */}
        <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={dismissBanner}
          className="absolute top-3 right-3 p-1 rounded-full border border-surface-container bg-surface/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-4">
          {/* Circular Icon Wrapper */}
          <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shadow-inner shrink-0 select-none">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 space-y-1.5 pr-4">
            <h4 className="text-sm font-bold text-on-surface flex items-center gap-1.5 leading-tight">
              <span>실시간 소식 알림 받기</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h4>
            <p className="text-[11px] text-on-surface-variant/90 leading-relaxed font-medium">
              새로운 콘텐츠가 업로드되거나 댓글 피드백이 등록되면 브라우저 푸시 알림으로 누구보다 빠르게 받아볼 수 있습니다.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-4 border-t border-surface-container/60 flex items-center justify-end gap-3">
          <button
            onClick={dismissBanner}
            className="text-[11px] font-bold text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-xl transition"
          >
            괜찮습니다
          </button>

          <button
            onClick={subscribePush}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all duration-300 shadow-md shadow-purple-600/15"
          >
            {isPending ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>승인 대기 중...</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>알림 활성화</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
