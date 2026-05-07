# CrocHub — Plan 11: Mobile PWA + Offline Experience 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~10 완료

**Goal:** CrocHub를 "설치 가능한 앱"으로 완성한다. 방문자는 홈 화면에 추가해 오프라인에서도 콘텐츠를 열람하고, 운영자는 App Store(iOS)/Play Store(Android)에 배포된 네이티브 래퍼 앱을 통해 더 넓은 도달 범위를 확보한다.

**모바일 전략 결정 (React Native vs PWA+Capacitor):**

> React Native는 별도 코드베이스가 생기고 유지비가 높다. 이 프로젝트는 이미 React + Vite 웹앱이 있고 Plan 6에서 Service Worker/Push 기초가 있다. **PWA 완성 + Capacitor 래핑** 전략이 적합하다: 코드 중복 없이 iOS/Android 앱 배포가 가능하다.

```text
전략: Web-first PWA → Capacitor로 App Store 배포
  ├── 기존 React + Vite 코드 100% 재사용
  ├── Workbox로 Service Worker 완성 (캐싱, 오프라인, 백그라운드 동기화)
  ├── Capacitor로 iOS/Android 네이티브 래퍼 생성
  └── App Store / Google Play 배포
```

**중요:**
- Plan 6에서 admin용 Service Worker(push notification)를 이미 구현했다. Plan 11은 **public-facing 전체 캐싱 전략**을 추가하고 기존 SW를 덮어쓰지 않도록 통합한다.
- Capacitor는 웹 코드를 WebView로 실행한다 — 순수 네이티브 성능이 필요한 기능(카메라, AR)이 생기면 해당 시점에 React Native 분리를 재검토한다.
- 오프라인 댓글 작성은 Background Sync API를 사용한다 (지원 브라우저 제한 있음, 미지원 시 graceful fallback).

**Architecture:**
- Workbox (vite-plugin-pwa) 를 사용해 Service Worker를 자동 생성하고 캐시 전략을 선언적으로 관리한다.
- Capacitor는 `npx cap init` 후 `ios/`, `android/` 폴더를 생성한다 — 이 폴더는 `.gitignore`에 추가하지 않고 커밋하되, 빌드 아티팩트(`ios/App/Pods/`, `android/.gradle/`)는 무시한다.
- 모바일 UX 개선은 Tailwind의 반응형 유틸리티와 `@media (hover: none)` 미디어 쿼리를 활용한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + Workbox (vite-plugin-pwa) + Capacitor + iOS (Xcode) + Android (Android Studio)

---

## Plan 11 범위

```text
PWA 완성
- Service Worker 캐싱 전략 (App Shell, Content, Media, API)
- 오프라인 fallback 페이지
- 백그라운드 동기화 (댓글 오프라인 작성)
- PWA install prompt (public 방문자용)
- Web App Manifest 완성 (아이콘, splash, theme color)

모바일 UX
- Bottom navigation bar (모바일)
- Touch gesture (swipe back, pull-to-refresh)
- 이미지 lazy load + 저대역폭 최적화
- 모바일 전용 버그 수정 및 레이아웃 폴리싱

Capacitor 앱 배포
- Capacitor iOS / Android 설정
- 네이티브 플러그인 (push notification, splash, status bar)
- App Store / Google Play 배포 준비 (메타데이터, 스크린샷)
- CI/CD: GitHub Actions → Capacitor 빌드 자동화
```

Plan 12로 넘길 내용:
```text
- 실시간 WebSocket (댓글 실시간 갱신, 방명록 실시간 알림)
- 심층 분석 대시보드 (코호트, 리텐션)
- 다국어(i18n) 완전 지원
```

---

## Task 목록

| # | 태스크 | 담당 | 비고 |
|---|--------|------|------|
| 1 | Web App Manifest + 아이콘 완성 | Gemini | |
| 2 | Workbox 캐싱 전략 통합 | Gemini | Plan 6 SW와 통합 |
| 3 | 오프라인 fallback 페이지 | Gemini | |
| 4 | 백그라운드 동기화 (댓글) | Gemini | Background Sync API |
| 5 | PWA install prompt (public) | Gemini | beforeinstallprompt |
| 6 | 모바일 Bottom Navigation | Gemini | |
| 7 | Touch gesture + Pull-to-Refresh | Gemini | |
| 8 | 이미지 최적화 + 저대역폭 | Gemini | |
| 9 | Capacitor 설정 (iOS + Android) | Gemini | |
| 10 | Capacitor 네이티브 플러그인 | Gemini | Push, Splash, StatusBar |
| 11 | App Store / Play Store 배포 준비 | Gemini | 메타데이터, 스크린샷 |
| 12 | CI/CD Capacitor 빌드 자동화 | Codex | GitHub Actions |
| 13 | 모바일 E2E + 접근성 regression | Codex | |

---

## Task 1: Web App Manifest + 아이콘 완성

**담당:** Gemini  
**선행 조건:** 없음 (Plan 6 Manifest가 있다면 이를 확장)

### Steps

- [x] Step 1: `frontend/public/manifest.json` 완성

```json
{
  "name": "CrocHub",
  "short_name": "CrocHub",
  "description": "나의 창작 세계 — 일상, 아트, 음악, 포트폴리오",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0f0f1a",
  "theme_color": "#a78bfa",
  "lang": "ko",
  "icons": [
    { "src": "/icons/icon-72.png",   "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",   "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png",  "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png",  "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-152.png",  "sizes": "152x152", "type": "image/png" },
    { "src": "/icons/icon-192.png",  "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-384.png",  "sizes": "384x384", "type": "image/png" },
    { "src": "/icons/icon-512.png",  "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png",      "sizes": "390x844", "type": "image/png", "form_factor": "narrow" },
    { "src": "/screenshots/portfolio.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "shortcuts": [
    { "name": "포트폴리오",  "url": "/portfolio", "icons": [{ "src": "/icons/shortcut-portfolio.png", "sizes": "96x96" }] },
    { "name": "검색",        "url": "/search",    "icons": [{ "src": "/icons/shortcut-search.png",    "sizes": "96x96" }] }
  ],
  "related_applications": [],
  "prefer_related_applications": false
}
```

- [x] Step 2: `purpose: "maskable"` 아이콘 생성 — safe zone은 전체 아이콘의 80% 내 원형 영역에 핵심 그래픽 배치

- [x] Step 3: `<meta name="apple-mobile-web-app-*">` 태그를 `index.html`에 추가

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CrocHub">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<link rel="apple-touch-startup-image" href="/splash/splash-390x844.png" media="...">
```

- [x] Step 4: Lighthouse PWA 점수 90+ 달성 확인 (manifest, icons, theme_color 항목 통과)

**Commit:** `feat(pwa): complete web app manifest with maskable icons and shortcuts`

---

## Task 2: Workbox 캐싱 전략 통합

**담당:** Gemini  
**선행 조건:** Task 1 완료, Plan 6 Service Worker 코드 파악

### 캐싱 전략 설계

```text
App Shell (HTML, JS, CSS 번들)  → CacheFirst, 빌드 해시 기반 버전 관리
API 응답 (홈 피드, 포트폴리오)  → NetworkFirst, 5분 max-age, 오프라인 시 캐시 반환
이미지 (Cloudflare R2 CDN)     → CacheFirst, 30일 만료, 최대 100개
폰트 (Google Fonts)             → StaleWhileRevalidate
외부 비디오 (YouTube embed)     → NetworkOnly (캐시 불가)
Push notification SW            → 기존 Plan 6 로직 유지 (통합)
```

### Steps

- [x] Step 1: `vite-plugin-pwa` 설치

```bash
npm install -D vite-plugin-pwa workbox-window
```

- [x] Step 2: `vite.config.ts`에 플러그인 추가

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',       // 업데이트 시 사용자에게 확인 요청
      injectRegister: 'auto',
      strategies: 'injectManifest', // 커스텀 SW와 통합하기 위해 injectManifest 사용
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: false,              // manifest.json은 별도 관리
      devOptions: { enabled: true }
    })
  ]
})
```

- [x] Step 3: `frontend/src/sw.ts` (커스텀 Service Worker) 작성

```typescript
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// App Shell precache (vite-plugin-pwa가 __WB_MANIFEST 주입)
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// API — NetworkFirst
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 300, maxEntries: 50 })]
  })
)

// 이미지 — CacheFirst
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 30, maxEntries: 100 })]
  })
)

// 폰트 — StaleWhileRevalidate
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({ cacheName: 'font-cache' })
)

// Plan 6 push notification 핸들러 (기존 로직 import 또는 인라인 유지)
// ...
```

- [x] Step 4: SW 업데이트 프롬프트 UI 컴포넌트 (`UpdatePrompt.tsx`) 추가

```tsx
// "새 버전이 있습니다. 지금 업데이트하시겠어요?" 토스트 배너
// workbox-window의 updatefound 이벤트 수신
```

- [x] Step 5: Plan 6에서 작성한 push notification SW 코드가 `sw.ts`에 통합되었는지 확인. 중복 이벤트 핸들러 제거.

- [x] Step 6: 테스트 — Chrome DevTools → Application → Service Workers → "Offline" 체크 후 홈 피드 로드 확인

**Commit:** `feat(pwa): integrate workbox caching strategies with injectManifest`

---

## Task 3: 오프라인 Fallback 페이지

**담당:** Gemini  
**선행 조건:** Task 2 완료

### Steps

- [x] Step 1: `frontend/src/pages/OfflinePage.tsx` 생성

```text
- 크로코다일 일러스트 (offline 테마)
- "인터넷 연결이 없습니다" 메시지
- 캐시된 콘텐츠가 있으면 "저장된 콘텐츠 보기" 버튼
- 재시도 버튼 (window.location.reload)
```

- [x] Step 2: `sw.ts`에 navigation fallback 등록

```typescript
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { createHandlerBoundToURL } from 'workbox-precaching'

// App Shell이 precache되어 있으면 SPA fallback 자동 처리
// 완전 오프라인 시 /offline.html precache 사용
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  })
)
```

- [x] Step 3: `frontend/public/offline.html` — SW install 전에도 작동하는 정적 fallback (CSS 인라인)

- [x] Step 4: 테스트 — DevTools Offline 모드에서 `/about` 접근 시 OfflinePage 표시 확인

**Commit:** `feat(pwa): add offline fallback page`

---

## Task 4: 백그라운드 동기화 (댓글 오프라인 작성)

**담당:** Gemini  
**선행 조건:** Task 2 완료

### 설계

```text
1. 오프라인 상태에서 댓글 작성 → IndexedDB에 임시 저장 (idb-keyval)
2. SW에 Background Sync 큐 등록 ('comment-sync')
3. 온라인 복귀 시 SW가 큐의 요청을 자동 재전송
4. 성공 시 IndexedDB에서 제거, 실패 시 재시도 (최대 3회)
5. Background Sync 미지원 브라우저: 온라인 복귀 감지 후 수동 재전송 UI 표시
```

### Steps

- [x] Step 1: `idb-keyval` 설치

```bash
npm install idb-keyval
```

- [x] Step 2: `frontend/src/lib/offlineComments.ts`

```typescript
import { set, get, del, keys } from 'idb-keyval'

interface PendingComment {
  id: string
  postId: number
  content: string
  createdAt: number
}

export const pendingComments = {
  async add(comment: Omit<PendingComment, 'id' | 'createdAt'>): Promise<string> { ... },
  async getAll(): Promise<PendingComment[]> { ... },
  async remove(id: string): Promise<void> { ... },
  async count(): Promise<number> { ... }
}
```

- [x] Step 3: `sw.ts`에 Background Sync 플러그인 등록

```typescript
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { NetworkOnly } from 'workbox-strategies'

const bgSyncPlugin = new BackgroundSyncPlugin('comment-sync', {
  maxRetentionTime: 24 * 60, // 24시간
})

registerRoute(
  ({ url }) => url.pathname === '/api/comments' && /* method POST */,
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
)
```

- [x] Step 4: 댓글 폼 컴포넌트 수정 — `navigator.onLine === false` 또는 fetch 실패 시 `pendingComments.add()` 호출

- [x] Step 5: `PendingCommentsBanner.tsx` — 오프라인 댓글이 있으면 상단 배너 표시 ("3개의 댓글이 전송 대기 중입니다")

- [x] Step 6: Background Sync 미지원 fallback — `window.addEventListener('online', ...)` 로 온라인 복귀 시 자동 재전송 시도

- [x] Step 7: 테스트:
  - `DevTools Offline → 댓글 작성 → Offline 해제 → 댓글 전송 성공` 플로우 확인
  - `pendingComments.add stores to IndexedDB`
  - 미지원 브라우저에서 fallback 배너 표시 확인

**Commit:** `feat(pwa): add background sync for offline comment drafts`

---

## Task 5: PWA Install Prompt (Public)

**담당:** Gemini  
**선행 조건:** Task 1, Task 2 완료

### 설계

```text
- Plan 6에서 admin용 install prompt를 구현했다면 재사용, 없다면 신규 작성
- 방문자가 3회 이상 방문 or 콘텐츠 30초 이상 체류 시 install prompt 표시
- "홈 화면에 추가" 배너 (하단 슬라이드업 스타일)
- iOS는 beforeinstallprompt가 없으므로 별도 안내 모달 표시
  ("Safari → 공유 → 홈 화면에 추가")
- "다시 보지 않기" 옵션 → localStorage에 기록
```

### Steps

- [x] Step 1: `usePWAInstall.ts` 훅

```typescript
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  // beforeinstallprompt 이벤트 캡처
  // appinstalled 이벤트로 설치 완료 감지
  // iOS 감지: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  const install = async () => { ... }
  const dismiss = () => { ... } // localStorage['pwa-dismissed'] = '1'

  return { canInstall: !!deferredPrompt || isIOS, isInstalled, isIOS, install, dismiss }
}
```

- [x] Step 2: `PWAInstallBanner.tsx` — 하단 fixed 배너

```text
[크로코다일 아이콘] "CrocHub를 홈 화면에 추가하세요" [추가하기] [×]
```

- [x] Step 3: iOS용 안내 모달 — Safari 공유 버튼 + "홈 화면에 추가" 단계 이미지 포함

- [x] Step 4: 방문 횟수 카운터 — sessionStorage로 방문 횟수 추적, 3회 도달 시 배너 표시

- [x] Step 5: Public layout에 `PWAInstallBanner` 삽입 (이미 설치했거나 dismissed면 숨김)

**Commit:** `feat(pwa): add public install prompt with iOS fallback`

---

## Task 6: 모바일 Bottom Navigation

**담당:** Gemini  
**선행 조건:** 없음

### 설계

```text
모바일 (max-width: 768px) 에서만 표시하는 하단 네비게이션 바
데스크탑에서는 기존 상단 헤더 네비게이션 사용

탭 구성:
  🏠 홈     /
  🔍 탐색   /search
  📁 포트폴리오  /portfolio
  🔔 알림   /notifications  (로그인 시 badge)
  👤 프로필  /profile
```

### Steps

- [x] Step 1: `BottomNav.tsx`

```tsx
const navItems = [
  { label: '홈',       icon: HomeIcon,         path: '/' },
  { label: '탐색',     icon: SearchIcon,       path: '/search' },
  { label: '포트폴리오', icon: GridIcon,         path: '/portfolio' },
  { label: '알림',     icon: BellIcon,         path: '/notifications', badge: unreadCount },
  { label: '프로필',   icon: UserCircleIcon,   path: '/profile' },
]
```

- [x] Step 2: Tailwind `sm:hidden` 클래스로 768px 이하에서만 표시, 고정 `bottom-0 left-0 right-0`

- [x] Step 3: Safe area 대응 — `pb-safe` 또는 `env(safe-area-inset-bottom)` padding 적용 (iPhone notch/home bar)

```css
padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);
```

- [x] Step 4: 페이지 콘텐츠 하단에 bottom nav 높이만큼 패딩 추가 (`pb-[64px] sm:pb-0`)

- [x] Step 5: 현재 route active 스타일 (라벤더 퍼플 하이라이트)

**Commit:** `feat(mobile): add bottom navigation bar for mobile`

---

## Task 7: Touch Gesture + Pull-to-Refresh

**담당:** Gemini  
**선행 조건:** Task 6 완료

### Steps

- [x] Step 1: `usePullToRefresh.ts` 훅

```typescript
// touchstart / touchmove / touchend 이벤트로 당김 감지
// threshold: 80px 이상 당기면 새로고침 트리거
// 스피너 애니메이션 표시 후 onRefresh() 콜백 호출
export function usePullToRefresh(onRefresh: () => Promise<void>, options?: { threshold?: number })
```

- [x] Step 2: 홈 피드 / 검색 결과 페이지에 `usePullToRefresh` 적용

- [x] Step 3: 이미지 갤러리 페이지 — swipe left/right로 다음/이전 이미지 탐색

```typescript
// useSwiperNavigation(onNext, onPrev) — touch delta > 50px on x-axis
```

- [x] Step 4: 댓글 아이템 — swipe left로 "신고" 버튼 노출 (모바일에서 context menu 대체)

- [x] Step 5: 모든 터치 이벤트에 `passive: true` 옵션 사용 (스크롤 성능)

- [x] Step 6: 테스트 — iPhone SE (375px) 시뮬레이터에서 pull-to-refresh 동작, swipe navigation 확인

**Commit:** `feat(mobile): add pull-to-refresh and swipe navigation`

---

## Task 8: 이미지 최적화 + 저대역폭 UX

**담당:** Gemini  
**선행 조건:** Plan 8 sharp 이미지 최적화 완료 여부 확인

### Steps

- [x] Step 1: `<img>` 태그에 `loading="lazy"` + `decoding="async"` 적용 (이미 되어 있다면 확인)

- [x] Step 2: `srcset` + `sizes` 추가 — Plan 8에서 sharp로 생성한 multi-resolution 이미지 활용

```html
<img
  src="/media/image-800.webp"
  srcset="/media/image-400.webp 400w, /media/image-800.webp 800w, /media/image-1200.webp 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  decoding="async"
  alt="..."
/>
```

- [x] Step 3: Blur placeholder (LQIP — Low Quality Image Placeholder)

```typescript
// Plan 8 업로드 시 sharp로 16x16 Base64 thumbnail을 생성해 DB에 저장
// 이미지 로드 전 blur CSS filter로 표시 → 로드 완료 시 fade-in
```

- [x] Step 4: `navigator.connection` API로 저대역폭 감지

```typescript
const connection = (navigator as any).connection
if (connection?.effectiveType === '2g' || connection?.saveData === true) {
  // 이미지 autoplay 비디오 비활성화, 저해상도 이미지 우선 로드
}
```

- [x] Step 5: 홈 피드 Intersection Observer 기반 점진적 로드 (`IntersectionObserver` + `rootMargin: '100px'`)

- [x] Step 6: WebP 미지원 브라우저 fallback — `<picture>` + `<source type="image/webp">` + `<img>` fallback

**Commit:** `perf(mobile): add lazy loading, srcset, blur placeholders, data-saver UX`

---

## Task 9: Capacitor 설정 (iOS + Android)

**담당:** Gemini  
**선행 조건:** Task 1~8 완료 (프로덕션 빌드 기준)

### Steps

- [x] Step 1: Capacitor 설치

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init CrocHub com.crochub.app --web-dir dist
```

- [x] Step 2: `capacitor.config.ts` 생성

```typescript
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.crochub.app',
  appName: 'CrocHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // 개발 시: hostname: '192.168.x.x:5173', cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  android: {
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS,
    }
  }
}
export default config
```

- [ ] Step 3: iOS / Android 플랫폼 추가

```bash
npx cap add ios
npx cap add android
```

- [ ] Step 4: `.gitignore` 업데이트

```gitignore
# Capacitor build artifacts
ios/App/Pods/
ios/App/App.xcworkspace/xcuserdata/
android/.gradle/
android/app/build/
# Keystore (민감 정보)
*.jks
*.keystore
```

- [ ] Step 5: 프로덕션 빌드 → Capacitor 복사 → 앱 실행 테스트

```bash
npm run build
npx cap sync
npx cap open ios     # Xcode
npx cap open android # Android Studio
```

- [ ] Step 6: API base URL 설정 — Capacitor 앱에서는 `http://localhost`가 아닌 실제 서버 URL 사용

```typescript
// frontend/src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.crochub.app'
```

- [ ] Step 7: CORS 설정 확인 — `Origin: capacitor://localhost` 또는 `com.crochub.app` 허용

**Commit:** `feat(capacitor): add iOS and Android platform configuration`

---

## Task 10: Capacitor 네이티브 플러그인

**담당:** Gemini  
**선행 조건:** Task 9 완료

### 플러그인 목록

| 플러그인 | 용도 |
|----------|------|
| `@capacitor/push-notifications` | 네이티브 push (FCM/APNs) |
| `@capacitor/splash-screen` | 네이티브 splash 화면 |
| `@capacitor/status-bar` | 상태바 색상/스타일 |
| `@capacitor/haptics` | 진동 피드백 (댓글 전송 성공 등) |
| `@capacitor/network` | 네트워크 상태 (WebView보다 정확) |

### Steps

- [x] Step 1: 플러그인 설치

```bash
npm install @capacitor/push-notifications @capacitor/splash-screen @capacitor/status-bar @capacitor/haptics @capacitor/network
npx cap sync
```

- [x] Step 2: Push Notifications 설정

iOS: `ios/App/App/AppDelegate.swift`에 APNs 등록 코드 추가 (Capacitor 공식 가이드 참조)  
Android: `google-services.json`을 `android/app/`에 배치 (Firebase 콘솔에서 다운로드, `.gitignore`에 추가)

```typescript
// frontend/src/lib/nativePush.ts
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

export async function registerNativePush() {
  if (!Capacitor.isNativePlatform()) return  // 웹에서는 Web Push API 사용 (Plan 6)

  await PushNotifications.requestPermissions()
  await PushNotifications.register()

  PushNotifications.addListener('registration', ({ value: token }) => {
    // 서버에 FCM/APNs 토큰 저장
    apiClient.post('/api/push/native-token', { token, platform: Capacitor.getPlatform() })
  })
}
```

- [x] Step 3: Splash Screen 설정 — `capacitor.config.ts`에 추가

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#0f0f1a',
    androidSplashResourceName: 'splash',
    showSpinner: false,
    launchAutoHide: true,
  }
}
```

- [x] Step 4: Status Bar 설정

```typescript
import { StatusBar, Style } from '@capacitor/status-bar'

// App 초기화 시 (App.tsx)
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark })
  StatusBar.setBackgroundColor({ color: '#0f0f1a' })
}
```

- [x] Step 5: Haptics — 댓글 전송 성공, 좋아요, 알림 탭 시 진동

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics'
// 성공: ImpactStyle.Light
// 오류: ImpactStyle.Heavy
```

- [x] Step 6: Backend — 네이티브 push token 저장 엔드포인트 추가

```text
POST /api/push/native-token
body: { token: string, platform: 'ios' | 'android' }
```

`push_subscriptions` 테이블에 `token_type: 'web' | 'fcm' | 'apns'` 컬럼 추가 (Prisma migration).

**Commit:** `feat(capacitor): add native push, splash, status bar, haptics plugins`

---

## Task 11: App Store / Play Store 배포 준비

**담당:** Gemini  
**선행 조건:** Task 9, Task 10 완료

### App Store (iOS)

- [ ] Step 1: Apple Developer Program 등록 확인 (연 $99)

- [ ] Step 2: Xcode에서 App signing 설정
  - Bundle ID: `com.crochub.app`
  - Team 설정, Provisioning Profile (Distribution)

- [ ] Step 3: `ios/App/App/Info.plist` 권한 설명 추가

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>새 콘텐츠 알림을 받기 위해 알림 권한이 필요합니다.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>사진을 저장하기 위해 접근 권한이 필요합니다.</string>
```

- [ ] Step 4: App Store Connect 메타데이터

```text
앱 이름: CrocHub
부제목: 나의 창작 세계
카테고리: 엔터테인먼트 / 소셜 네트워킹
연령 등급: 4+
설명: 고등학생 창작자의 일상, 아트, 음악, 포트폴리오를 한 곳에서.
키워드: 포트폴리오,크리에이터,아트,음악,블로그
```

- [ ] Step 5: 스크린샷 6.5인치(iPhone 14 Pro Max) + 5.5인치(iPhone 8 Plus) 각 3~5장 캡처

### Google Play (Android)

- [ ] Step 6: Google Play Console 등록 (일회성 $25)

- [ ] Step 7: 서명 키 생성 (최초 1회)

```bash
keytool -genkey -v -keystore crochub-release.jks \
  -alias crochub -keyalg RSA -keysize 2048 -validity 10000
```

> `crochub-release.jks`는 절대 커밋하지 않는다. 안전한 곳에 보관.

- [ ] Step 8: `android/app/build.gradle`에 signing config 추가 (환경변수 참조)

- [ ] Step 9: Play Store 메타데이터 — 짧은 설명(80자), 전체 설명(4000자), Feature Graphic(1024×500)

- [ ] Step 10: AAB(Android App Bundle) 빌드

```bash
cd android && ./gradlew bundleRelease
```

**Commit:** `chore(release): add app store metadata and signing configuration`

---

## Task 12: CI/CD Capacitor 빌드 자동화

**담당:** Codex  
**선행 조건:** Task 9~11 완료

### Steps

- [ ] Step 1: `.github/workflows/mobile-build.yml` 생성

```yaml
name: Mobile Build
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  web-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with: { name: web-dist, path: frontend/dist }

  ios-build:
    runs-on: macos-latest
    needs: web-build
    if: startsWith(github.ref, 'refs/tags/')  # 태그 push 시에만
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { name: web-dist, path: frontend/dist }
      - run: npm ci && npx cap sync ios
      - uses: apple-actions/import-codesign-certs@v2
        with:
          p12-file-base64: ${{ secrets.APPLE_P12_BASE64 }}
          p12-password: ${{ secrets.APPLE_P12_PASSWORD }}
      - run: xcodebuild archive -workspace ios/App/App.xcworkspace ...
      # fastlane deliver 또는 xcrun altool로 App Store Connect 업로드

  android-build:
    runs-on: ubuntu-latest
    needs: web-build
    if: startsWith(github.ref, 'refs/tags/')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { name: web-dist, path: frontend/dist }
      - run: npm ci && npx cap sync android
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '17' }
      - run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/crochub-release.jks
          cd android && ./gradlew bundleRelease
      - uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.crochub.app
          releaseFiles: android/app/build/outputs/bundle/release/*.aab
          track: internal
```

- [ ] Step 2: GitHub Secrets 추가 목록 문서화

```text
APPLE_P12_BASE64            iOS 코드사이닝 인증서 (Base64)
APPLE_P12_PASSWORD          인증서 비밀번호
ANDROID_KEYSTORE_BASE64     Android 키스토어 (Base64)
ANDROID_KEYSTORE_PASSWORD   키스토어 비밀번호
ANDROID_KEYSTORE_ALIAS      키 alias
GOOGLE_PLAY_SERVICE_ACCOUNT Google Play API 서비스 계정 JSON
```

- [ ] Step 3: `main` 브랜치 push는 웹 빌드만 실행, `v*` 태그는 전체 모바일 빌드 + 스토어 업로드

- [ ] Step 4: Fastlane 선택적 도입 — `Fastfile`이 있으면 `xcodebuild` 대신 `fastlane beta`/`fastlane deliver` 사용

**Commit:** `ci: add GitHub Actions workflow for iOS and Android Capacitor builds`

---

## Task 13: 모바일 E2E + 접근성 Regression

**담당:** Codex  
**선행 조건:** Task 6~8 완료

### Steps

- [ ] Step 1: Playwright 모바일 프로파일로 주요 플로우 테스트

```typescript
// playwright.config.ts에 추가
projects: [
  { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
]
```

테스트 대상:
```text
- 홈 피드 로드 (모바일)
- 검색 (한국어 키워드)
- Bottom nav 탭 전환
- Pull-to-refresh 후 콘텐츠 갱신
- 오프라인 fallback 페이지 표시
```

- [ ] Step 2: Lighthouse CI 모바일 점수 기준

```text
Performance: 70+
Accessibility: 95+
Best Practices: 90+
SEO: 90+
PWA: 90+
```

- [ ] Step 3: `axe-core` 접근성 자동 테스트 — Bottom nav, OfflinePage, PWAInstallBanner 포함

- [ ] Step 4: 터치 타겟 크기 검사 — 모든 인터랙티브 요소 최소 44×44px (iOS HIG 기준)

- [ ] Step 5: Plan 10 기능 (알림, 검색, 컬렉션) 모바일에서 regression 확인

**Commit:** `test(mobile): add mobile e2e tests and accessibility regression`

---

## Plan 11 완료 기준

```text
✓ Web App Manifest + maskable 아이콘 세트 완성, Lighthouse PWA 90+
✓ Workbox App Shell / API / Image 캐싱 전략 적용
✓ 오프라인 fallback 페이지 동작
✓ 오프라인 댓글 작성 → Background Sync 또는 online 복귀 시 자동 전송
✓ PWA install prompt (Android beforeinstallprompt + iOS 안내 모달) 동작
✓ 모바일 Bottom Navigation 표시 및 active 상태 정확
✓ Pull-to-refresh 80px 임계값 동작
✓ 이미지 lazy load + srcset + blur placeholder 적용
✓ Capacitor iOS/Android 플랫폼 추가, Xcode/Android Studio에서 실행 가능
✓ 네이티브 Push, Splash, StatusBar 플러그인 동작
✓ App Store / Play Store 메타데이터 준비 완료
✓ GitHub Actions v* 태그 push 시 iOS + Android 빌드 자동화
✓ 모바일 Playwright 테스트 통과, Lighthouse 모바일 70+
```

---

## 기술 부채 메모

```text
- google-services.json은 Firebase 콘솔에서 수동으로 다운로드해 android/app/에 배치해야 한다.
  CI에서는 GitHub Secret으로 주입한다. 절대 커밋하지 않는다.
- APNs 인증서는 1년 만료 — 갱신 일정을 캘린더에 등록한다.
- Background Sync API는 Safari(iOS) 미지원 (2026년 기준). 폴백 구현 필수.
- Capacitor WebView와 브라우저 간 Service Worker 동작 차이 존재.
  Capacitor 앱에서는 `capacitor://localhost` origin으로 요청이 발생 — CORS, CSP 설정 확인.
```
