import { useState, useEffect } from 'react';

export function useRegisterSWCustom() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [wbRegistration, setWbRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // 현재 등록된 서비스 워커 핸들링 및 실시간 관측
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        setWbRegistration(registration);

        // 1. 이미 대기 중인(waiting) 새로운 서비스 워커가 있는 경우
        if (registration.waiting) {
          setNeedRefresh(true);
        }

        // 2. 새로운 서비스 워커가 설치/대기 중인지 리스닝
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 이미 컨트롤러가 있다면(기존 버전 존재) -> 업데이트 필요 알림
                setNeedRefresh(true);
              } else {
                // 첫 설치인 경우 -> 오프라인 사용 가능 알림
                setOfflineReady(true);
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('⚠️ [PWA] Service Worker registration failed:', error);
      });

    // 3. 컨트롤러 교체(SKIP_WAITING) 시 페이지 자동 새로고침 처리
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const updateServiceWorker = (reloadPage = true) => {
    if (wbRegistration && wbRegistration.waiting) {
      // 대기 중인 서비스 워커에 즉각 SKIP_WAITING 명령 하달
      wbRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      if (reloadPage) {
        // 교체 즉시 리로드 감지 안 될 경우에 대비한 폴백 리로드
        setTimeout(() => window.location.reload(), 500);
      }
    }
  };

  return {
    offlineReady: [offlineReady, setOfflineReady] as const,
    needRefresh: [needRefresh, setNeedRefresh] as const,
    updateServiceWorker,
  };
}
