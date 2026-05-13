import { usePushPermission } from '../../hooks/usePushPermission';
import { Bell, BellOff, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function NotificationOptInCard() {
  const { isSupported, permission, isSubscribed, isPending, subscribePush } = usePushPermission();

  if (!isSupported) {
    return (
      <div className="rounded-2xl border border-surface-container bg-surface/40 p-5 text-center space-y-2">
        <BellOff className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
        <h4 className="text-xs font-bold text-on-surface-variant">알림 미지원 브라우저</h4>
        <p className="text-[10px] text-on-surface-variant/70 leading-relaxed font-medium">
          현재 사용 중이신 브라우저는 실시간 웹 푸시 알림 수신을 지원하지 않습니다. Chrome 이나 Safari 브라우저를 권장합니다.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-surface-container bg-surface p-5 space-y-4 shadow-sm relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute -right-6 -top-6 w-16 h-16 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isSubscribed ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
        }`}>
          {isSubscribed ? <Bell className="w-5 h-5 animate-pulse" /> : <BellOff className="w-5 h-5" />}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold text-on-surface">실시간 푸시 알림 상태</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed font-medium">
            블로그 새 글 소식이나 중요한 공지사항을 장치 잠금 화면에서 브라우저 팝업 알림으로 바로 확인하세요.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-surface-container/60 flex items-center justify-between gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 select-none">
          {permission === 'denied' ? (
            <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>브라우저 차단됨</span>
            </div>
          ) : isSubscribed ? (
            <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>수신 설정 활성</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-on-surface-variant text-[10px] font-bold">
              <BellOff className="w-3.5 h-3.5" />
              <span>비활성화 상태</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {permission === 'denied' ? (
          <p className="text-[9px] text-on-surface-variant/80 font-medium text-right max-w-[150px] leading-snug">
            브라우저 설정 주소창 옆의 자물쇠/설정 아이콘을 클릭하여 알림 권한을 허용해 주세요.
          </p>
        ) : isSubscribed ? (
          <span className="text-[10px] font-bold text-green-500 px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/10 select-none">
            설정 완료
          </span>
        ) : (
          <button
            onClick={subscribePush}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {isPending ? '수신 동의 중...' : '알림 켜기'}
          </button>
        )}
      </div>

    </div>
  );
}
