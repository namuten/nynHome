import { useState, useEffect } from 'react';
import { pushApi } from '../lib/pushApi';

const DISMISS_KEY = 'crochub:push-permission-dismissed-at';
const DISMISS_DURATION_DAYS = 7;

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

export function usePushPermission() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showBanner, setShowBanner] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // Web Push API 지원 여부 확인
    const isPushSupported = 
      'serviceWorker' in navigator && 
      'PushManager' in window && 
      'Notification' in window;
    
    setIsSupported(isPushSupported);

    if (!isPushSupported) return;

    setPermission(Notification.permission);

    // 이미 권한이 부여된 경우, 구독이 존재하고 연결이 활성화되어 있는지 점검
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            setIsSubscribed(true);
          }
        });
      });
    }

    // 디스미스 이력 확인 (7일 제한)
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    let isRecentlyDismissed = false;
    if (dismissedAt) {
      const dismissDate = new Date(parseInt(dismissedAt, 10));
      const differenceInTime = Date.now() - dismissDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      if (differenceInDays < DISMISS_DURATION_DAYS) {
        isRecentlyDismissed = true;
      }
    }

    // 권한을 부여받지 않았고 최근에 닫지 않은 경우 배너 표시 권장
    if (Notification.permission === 'default' && !isRecentlyDismissed) {
      setShowBanner(true);
    }
  }, []);

  const subscribePush = async () => {
    if (!isSupported) return false;

    setIsPending(true);
    try {
      // 1. 브라우저 알림 권한 획득 요구
      const permResult = await Notification.requestPermission();
      setPermission(permResult);

      if (permResult !== 'granted') {
        console.warn('⚠️ Web push permission was denied.');
        setIsPending(false);
        setShowBanner(false);
        return false;
      }

      // 2. 서비스 워커 인스턴스 획득
      const registration = await navigator.serviceWorker.ready;

      // 3. 백엔드로부터 VAPID Public Key Fetch
      const { publicKey } = await pushApi.getVapidPublicKey();
      if (!publicKey) {
        throw new Error('VAPID_PUBLIC_KEY_NOT_FOUND_ON_SERVER');
      }

      // 4. Web Push Subscription 구독 요청 전송
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // 5. 백엔드 API 호출하여 DB 세팅 완료
      const subJson = subscription.toJSON();
      await pushApi.subscribeUser({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh || '',
          auth: subJson.keys?.auth || '',
        },
      });

      setIsSubscribed(true);
      setShowBanner(false);
      setIsPending(false);
      console.log('🔔 Web push subscription fully established on server.');
      return true;
    } catch (err) {
      console.error('❌ Failed to subscribe user to web push alerts:', err);
      setIsPending(false);
      return false;
    }
  };

  const dismissBanner = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowBanner(false);
  };

  return {
    isSupported,
    permission,
    showBanner,
    isSubscribed,
    isPending,
    subscribePush,
    dismissBanner,
  };
}
