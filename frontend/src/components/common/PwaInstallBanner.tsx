import { useState, useEffect } from 'react';
import { Download, Bell, X, ShieldCheck, Star } from 'lucide-react';
import { api } from '../../lib/api';

const VAPID_PUBLIC_KEY = 'BLe0W6yk3UMp5shvgU2-rGAGVk8jpSR3_qZGHraNTjozoRHPS0-S3SIGRpZ79RA35mnKs6V62UZHqiF23lJddho';

// VAPID 키 변환 유틸리티
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * PwaInstallBanner - PWA 설치 제안 및 백그라운드 푸시 알림 수신 동의 통합 UX 배너 컴포넌트
 * - 브라우저 beforeinstallprompt 이벤트를 캡처하여 인앱 앱 설치 플로팅 배너 노출
 * - 브라우저 Notification 권한이 미정 상태일 때 매혹적인 푸시 알림 구독 제안 유도
 * - 수려한 마이크로 인터랙션과 Glassmorphism 효과 적용
 */
export default function PwaInstallBanner() {
  // PWA 관련 상태
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // 푸시 알림 수신 동의 관련 상태
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [subscribing, setSubscribing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // 1. PWA 설치 이벤트 감지 리스너 바인딩
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 이미 설치된 상태라면 굳이 제안하지 않음
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('CrocHub PWA가 성공적으로 설치되었습니다.');
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      triggerToast('🎉 앱 설치가 완료되었습니다! 홈 화면에서 바로 기동할 수 있습니다.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 2. 브라우저 알림 동의 권한 체크
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      // 이미 알림 동의를 했거나, 거절한 상태가 아니라면 은은하게 유도 제안 배너 활성화
      if (Notification.permission === 'default') {
        // 사이트 진입 후 4초 뒤 부드럽게 노출 (사용자 방해 최소화 고도화 UX)
        const timer = setTimeout(() => {
          setShowNotificationBanner(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 토스트 트리거 헬퍼
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // 1) PWA 인앱 설치 시도
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA 설치 동의 결과: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // 2) 브라우저 백그라운드 푸시 알림 신청 및 허용 절차
  const handleSubscribeNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      triggerToast('❌ 죄송합니다. 현재 브라우저는 백그라운드 푸시 알림 기술을 지원하지 않습니다.');
      return;
    }

    try {
      setSubscribing(true);
      // 브라우저 권한 팝업 띄우기
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'denied') {
        triggerToast('⚠️ 알림 수신이 차단되었습니다. 주소창 왼쪽의 자물쇠 아이콘을 눌러 허용으로 변경해 주세요.');
        setShowNotificationBanner(false);
        setSubscribing(false);
        return;
      }

      if (permission === 'granted') {
        // 서비스 워커 구동 준비 확인
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID 퍼블릭 키 기반 브라우저 푸시 토큰 생성
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // 백엔드 엔드포인트 전송 (로그인 토큰 헤더는 API 인스턴스에 의해 자동 주입)
        await api.post('/push/subscribe', subscription);

        triggerToast('🔔 푸시 알림 수신 동의 완료! 중요한 실시간 소식을 가장 빠르게 배달해 드릴게요.');
        setShowNotificationBanner(false);
      }
    } catch (err: any) {
      console.error('푸시 알림 구독 오류:', err);
      triggerToast('❌ 푸시 동의 처리 중 통신 에러가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      {/* 1. 수려한 하단 플로팅 PWA 설치 제안 카드 */}
      {showInstallBanner && (
        <div className="fixed bottom-6 left-6 z-40 max-w-sm bg-white/90 backdrop-blur-xl border border-surface-container rounded-3xl p-4 shadow-xl animate-scale-up flex items-center justify-between gap-4 font-body">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-black text-on-surface">앱으로 홈 화면에 설치</h4>
              <p className="text-[10px] text-on-surface-variant font-bold mt-0.5 leading-tight">
                크록허브를 데스크톱 및 모바일 앱으로 쾌적하게 사용해보세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallApp}
              className="px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl hover:bg-primary-container hover:text-primary transition shadow-sm"
            >
              설치
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition"
              title="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. 최상단 긴급 푸시 수신 권장 동의 배너 */}
      {showNotificationBanner && notificationPermission === 'default' && (
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-y border-primary/10 py-3.5 px-6 font-body flex flex-col md:flex-row md:items-center justify-between gap-3 animate-fade-in select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bell className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-on-surface flex items-center gap-1.5">
                실시간 개인 일정 및 중요한 크록허브 공지 알림을 받으시겠습니까?
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary/10 text-[9px] text-primary font-black">
                  <Star className="w-2.5 h-2.5 fill-current" /> PWA 추천
                </span>
              </h4>
              <p className="text-[10px] text-on-surface-variant font-bold leading-normal">
                브라우저 알림 동의 시, 사이트를 닫아도 배경 화면 상에 중요 일정 및 알림 메시지가 실시간으로 즉각 송출됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => setShowNotificationBanner(false)}
              className="px-3.5 py-1.5 border border-surface-container bg-white rounded-xl text-[10px] font-black text-on-surface-variant hover:bg-surface-container transition"
            >
              다음에 할게요
            </button>
            <button
              onClick={handleSubscribeNotifications}
              disabled={subscribing}
              className="px-4 py-1.5 bg-primary text-white rounded-xl text-[10px] font-black hover:bg-primary-container hover:text-primary transition shadow-sm disabled:opacity-50"
            >
              {subscribing ? '구독 신청 중...' : '실시간 알림 켜기'}
            </button>
          </div>
        </div>
      )}

      {/* 3. 성공/안내 토스트 팝업 */}
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-white p-4 rounded-2xl shadow-xl animate-slide-in flex items-start gap-2.5 font-body">
          <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-xs font-black leading-relaxed">{toastMessage}</p>
        </div>
      )}
    </>
  );
}
