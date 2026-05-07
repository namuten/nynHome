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
  const [isIOS, setIsIOS] = useState(false);

  // 푸시 알림 수신 동의 관련 상태
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [subscribing, setSubscribing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // 1. iOS 기기 여부 감지
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === '1';

    // 2. 방문 횟수(sessionStorage 기반) 및 체류 시간 제어부
    let visitCount = Number(sessionStorage.getItem('pwa-visit-count') || '0');
    visitCount += 1;
    sessionStorage.setItem('pwa-visit-count', String(visitCount));

    const checkAndTriggerPrompt = () => {
      if (isStandalone || isDismissed) return false;
      // 방문 3회 이상이거나, 혹은 30초 이상 체류 시 노출 조건 충족
      return visitCount >= 3;
    };

    // 3. PWA 설치 이벤트 감지 리스너 바인딩 (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      if (checkAndTriggerPrompt()) {
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

    // 30초 콘텐츠 체류 타이머 (방문 횟수가 미달되어도 30초 체류하면 설치 제안)
    const dwellTimer = setTimeout(() => {
      if (!isStandalone && !isDismissed) {
        if (isIosDevice) {
          setShowInstallBanner(true);
        } else if (deferredPrompt) {
          setShowInstallBanner(true);
        }
      }
    }, 30000);

    // iOS 최초 접속 시 방문 횟수 기반 수동 검사 노출
    if (isIosDevice && visitCount >= 3 && !isStandalone && !isDismissed) {
      setShowInstallBanner(true);
    }

    // 4. 브라우저 알림 동의 권한 체크
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        const notifyTimer = setTimeout(() => {
          setShowNotificationBanner(true);
        }, 5000);
        return () => {
          clearTimeout(notifyTimer);
          clearTimeout(dwellTimer);
        };
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(dwellTimer);
    };
  }, [deferredPrompt]);

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

  // 닫기 + localStorage에 '다시 보지 않기' 기록 수렴
  const handleDismissInstall = () => {
    localStorage.setItem('pwa-install-dismissed', '1');
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
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'denied') {
        triggerToast('⚠️ 알림 수신이 차단되었습니다. 주소창 왼쪽의 자물쇠 아이콘을 눌러 허용으로 변경해 주세요.');
        setShowNotificationBanner(false);
        setSubscribing(false);
        return;
      }

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

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
      {/* 1. 수려한 하단 플로팅 PWA 설치 제안 카드 (Android, iOS 및 Desktop 대응) */}
      {showInstallBanner && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:right-auto z-40 max-w-sm bg-slate-900/90 border border-violet-500/20 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-fade-in-up flex items-start justify-between gap-4 font-body text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                {isIOS ? '🐊 CrocHub를 홈 화면에 추가' : '🐊 CrocHub 앱으로 쾌적한 감상'}
              </h4>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 leading-normal">
                {isIOS 
                  ? 'Safari 브라우저 하단의 [공유] 버튼(네모 모양에 위 화살표)을 클릭한 후, [홈 화면에 추가]를 선택하시면 오프라인 상태에서도 간편하게 감상할 수 있습니다.' 
                  : '크록허브를 데스크톱 및 모바일 앱으로 홈 화면에 즉시 설치하여 보다 빠르고 쾌적하게 사용해보세요!'}
              </p>
            </div>
          </div>
 
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleDismissInstall}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="다시 보지 않기"
            >
              <X className="w-4 h-4" />
            </button>
            {!isIOS && (
              <button
                onClick={handleInstallApp}
                className="px-3.5 py-1.5 bg-violet-600 text-white text-[10px] sm:text-xs font-semibold rounded-xl hover:bg-violet-500 transition shadow-lg shadow-violet-600/25 cursor-pointer active:scale-95"
              >
                설치
              </button>
            )}
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
