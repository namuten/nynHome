/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// 1. App Shell Precache (Vite-plugin-pwa가 __WB_MANIFEST를 주입해 줍니다)
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// SPA Navigation Fallback (오프라인 상태에서 임의 주소 접근 시 앱 셸 리다이렉션)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  })
);

// 1.5. 오프라인 댓글 백그라운드 동기화 (Background Sync API 지원 브라우저용)
const bgSyncPlugin = new BackgroundSyncPlugin('comment-sync', {
  maxRetentionTime: 24 * 60, // 최대 24시간 동안 보존 및 네트워크 복귀 시 자동 재시도
});

registerRoute(
  ({ url, request }) => url.pathname.endsWith('/api/comments') && request.method === 'POST',
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// 2. API 캐싱 — NetworkFirst (오프라인인 경우 신속히 캐시 데이터 제공)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'crochub-api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5분 캐싱 보존
      }),
    ],
  })
);

// 3. 정적 이미지 캐싱 — CacheFirst (CDN/R2 미디어 포함)
registerRoute(
  ({ request, url }) => 
    request.destination === 'image' || 
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.jpg') || 
    url.pathname.endsWith('.jpeg') || 
    url.pathname.endsWith('.webp') || 
    url.pathname.endsWith('.svg'),
  new CacheFirst({
    cacheName: 'crochub-image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30일 장기 보존
      }),
    ],
  })
);

// 4. 구글 웹 폰트 캐싱 — StaleWhileRevalidate
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com' || url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'crochub-font-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1년 보존
      }),
    ],
  })
);

// 5. 정적 에셋 및 벤더 라이브러리 (JS, CSS) — StaleWhileRevalidate
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'crochub-assets-cache',
  })
);

// 6. 브라우저 실시간 Web Push 알림 수신 동기화 리스너 (Plan 6 로직 통합)
self.addEventListener('push', (event: PushEvent) => {
  let payload = { title: 'CrocHub', body: '새로운 알림이 도착했습니다.', url: '/' };
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  const options: NotificationOptions & { vibrate?: number[] } = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// 알림 팝업 클릭 시 탭 이동 및 활성화 기믹
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 이미 열려 있는 탭이 있다면 그 탭으로 포커스
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 열린 탭이 없다면 신규 브라우저 창 개설
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// 서비스 워커 대리 활성화 제어권 갱신
self.addEventListener('install', () => {
  self.skipWaiting();
});
