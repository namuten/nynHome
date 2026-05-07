# CrocHub — Plan 12: Real-time + Advanced Analytics + i18n + Platform Maturity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~11 완료

**Goal:** CrocHub 플랫폼의 최종 완성도를 높인다. 세 가지 축:
1. **Real-time** — 댓글/알림을 WebSocket으로 실시간 갱신, 관리자 moderation queue live feed
2. **Advanced Analytics** — Plan 8 raw events 위에 코호트·리텐션·funnel 분석 레이어 추가
3. **i18n** — 한국어 기본 + 영어 전환, 포트폴리오를 국제 학교 진학 서류에 활용할 수 있도록

**중요:**
- WebSocket 서버는 현재 단일 Docker 컨테이너 환경에 맞게 설계한다. 수평 확장이 필요해지면 그때 Redis Pub/Sub adapter를 추가한다 — 지금은 Redis 의존성을 추가하지 않는다.
- Advanced Analytics는 Plan 8의 `analytics_events` + `daily_analytics_rollups`를 읽어서 집계한다. 새 수집 파이프라인은 추가하지 않는다.
- i18n은 UI 문자열(KO/EN)만 다룬다. DB 콘텐츠(게시글 본문 등) 다국어화는 범위 밖이다 — "포트폴리오 페이지 UI 언어만 전환"이 목표.

**Architecture:**
- WebSocket: `socket.io` (Express 서버에 attach). 방 구조: `post:{id}` (댓글 실시간), `admin:moderation`, `admin:notifications`.
- Analytics 집계: MySQL에서 GROUP BY 쿼리로 코호트/리텐션 계산. 데이터가 많아지면 `daily_analytics_rollups` 활용.
- i18n: `react-i18next` + `i18next-http-backend`. 번역 파일 `frontend/public/locales/{lang}/translation.json`.

**Tech Stack:** React + Vite + TypeScript + Tailwind + Socket.IO (v4) + react-i18next + Express + Prisma + MySQL

---

## Plan 12 범위

```text
Real-time
- WebSocket 서버 설정 (Socket.IO)
- 댓글 실시간 추가/숨김 반영
- 알림 badge 실시간 업데이트 (Plan 10 폴링 → WebSocket 교체)
- Admin moderation queue live feed

Advanced Analytics
- 일별/주별/월별 방문자 트렌드 차트
- Top pages 분석
- 방문자 리텐션 (7일/30일 재방문율)
- 유입 경로 (referrer) 분석
- 콘텐츠별 조회수 랭킹

i18n (KO/EN)
- react-i18next 설정
- UI 번역 파일 (KO default, EN)
- 언어 전환 UI (header switcher)
- 포트폴리오/프로필 페이지 영문 메타 태그

Platform Maturity
- 에러 경계 (React Error Boundary)
- 전역 로딩/에러 상태 일관성
- 404/500 커스텀 페이지
- 의존성 보안 감사 자동화
- 최종 졸업 체크리스트
```

---

## Task 목록

| # | 태스크 | 담당 | 비고 |
|---|--------|------|------|
| 1 | Socket.IO 서버 설정 | Gemini | Redis 없이 단일 서버 |
| 2 | 댓글 실시간 WebSocket | Gemini | |
| 3 | 알림 실시간 (폴링 교체) | Gemini | Plan 10 NotificationBell 수정 |
| 4 | Admin moderation live feed | Gemini | |
| 5 | Analytics 트렌드 차트 | Gemini | recharts 또는 Chart.js |
| 6 | Analytics 리텐션 + Funnel | Gemini | SQL 집계 쿼리 |
| 7 | Analytics referrer + 콘텐츠 랭킹 | Gemini | |
| 8 | react-i18next 설정 + KO 번역 파일 | Gemini | |
| 9 | EN 번역 파일 + 언어 전환 UI | Gemini | |
| 10 | 포트폴리오 EN 메타 태그 | Gemini | |
| 11 | Error Boundary + 404/500 페이지 | Gemini | |
| 12 | 의존성 보안 감사 자동화 | Codex | `npm audit` CI |
| 13 | 최종 E2E + 졸업 체크리스트 | Codex | |

---

## Task 1: Socket.IO 서버 설정

**담당:** Gemini  
**선행 조건:** 없음

### 설계

```text
현재: Express HTTP 서버 단독
변경: Express HTTP → http.createServer → Socket.IO attach

단일 서버 방 구조:
  post:{postId}         - 해당 게시글 댓글 실시간
  guestbook             - 방명록 실시간
  admin:moderation      - 관리자 전용, 신고/숨김 live
  admin:notifications   - 관리자 전용, 새 알림 live
```

### Steps

- [ ] Step 1: 의존성 추가

```bash
npm install socket.io
npm install --save-dev @types/node   # http 모듈 타입
```

- [ ] Step 2: `backend/src/socket/socket.server.ts` — 서버 생성 및 미들웨어

```typescript
import { Server } from 'socket.io'
import http from 'http'
import type { Express } from 'express'

export function createSocketServer(app: Express): http.Server {
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    },
    // pingTimeout/pingInterval 기본값 유지 (25s/20s)
  })

  // 관리자 전용 namespace 인증 미들웨어
  const adminNsp = io.of('/admin')
  adminNsp.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined
    const user = await verifyAdminToken(token)  // 기존 JWT 검증 재사용
    if (!user) return next(new Error('unauthorized'))
    socket.data.user = user
    next()
  })

  return httpServer
}

export let io: Server  // 다른 모듈에서 emit하려면 이 인스턴스 참조
```

- [ ] Step 3: `backend/src/main.ts` 수정 — `app.listen` → `httpServer.listen`

```typescript
// before: app.listen(PORT, ...)
// after:
const httpServer = createSocketServer(app)
httpServer.listen(PORT, () => console.log(`Server running on :${PORT}`))
```

- [ ] Step 4: `backend/src/socket/rooms.ts` — 방 이름 상수 정의

```typescript
export const ROOMS = {
  post: (id: number) => `post:${id}`,
  guestbook: 'guestbook',
  adminModeration: 'admin:moderation',
  adminNotifications: 'admin:notifications',
}
```

- [ ] Step 5: Docker Compose — 포트 노출 확인 (backend port 이미 있으면 WebSocket도 같은 포트 사용)

- [ ] Step 6: 테스트 — `wscat -c ws://localhost:3000/socket.io/?EIO=4&transport=websocket` 연결 확인

**Commit:** `feat(websocket): add socket.io server with admin namespace auth`

---

## Task 2: 댓글 실시간 WebSocket

**담당:** Gemini  
**선행 조건:** Task 1 완료

### 이벤트 설계

```text
서버 → 클라이언트:
  comment:created  { comment: CommentDTO }       방: post:{postId}
  comment:hidden   { commentId, hiddenReason }   방: post:{postId}
  comment:restored { commentId }                 방: post:{postId}

클라이언트 → 서버:
  join:post  { postId }   → 서버가 socket을 post:{postId} 방에 추가
  leave:post { postId }   → 방 떠남
```

### Steps

- [ ] Step 1: `backend/src/socket/handlers/comment.handler.ts`

```typescript
export function registerCommentHandler(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join:post', ({ postId }: { postId: number }) => {
      socket.join(ROOMS.post(postId))
    })
    socket.on('leave:post', ({ postId }: { postId: number }) => {
      socket.leave(ROOMS.post(postId))
    })
  })
}

// emit 헬퍼 (comments.service.ts에서 호출)
export function emitCommentCreated(io: Server, postId: number, comment: CommentDTO) {
  io.to(ROOMS.post(postId)).emit('comment:created', { comment })
}
export function emitCommentHidden(io: Server, postId: number, commentId: number, reason: string) {
  io.to(ROOMS.post(postId)).emit('comment:hidden', { commentId, hiddenReason: reason })
}
```

- [ ] Step 2: `comments.service.ts` 수정 — 댓글 생성/숨김/복원 후 `emitComment*` 호출

- [ ] Step 3: Frontend — `frontend/src/hooks/useCommentSocket.ts`

```typescript
export function useCommentSocket(postId: number, onNewComment: (c: Comment) => void) {
  useEffect(() => {
    const socket = getSocket()  // singleton socket instance
    socket.emit('join:post', { postId })
    socket.on('comment:created', ({ comment }) => onNewComment(comment))
    socket.on('comment:hidden', ({ commentId }) => { /* 해당 댓글 숨김 처리 */ })
    return () => {
      socket.emit('leave:post', { postId })
      socket.off('comment:created')
      socket.off('comment:hidden')
    }
  }, [postId])
}
```

- [ ] Step 4: `frontend/src/lib/socket.ts` — singleton socket instance

```typescript
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })
  }
  return socket
}
```

- [ ] Step 5: 댓글 목록 컴포넌트에 `useCommentSocket` 적용 — 새 댓글이 실시간 append, 낙관적 업데이트와 충돌 방지

- [ ] Step 6: 연결 상태 표시 — 소켓 연결 실패 시 조용히 REST 폴백 (10초 간격 refetch)

- [ ] Step 7: 테스트:
  - `브라우저 탭 2개로 같은 게시글 열기 → 한쪽에서 댓글 작성 → 다른 탭에 즉시 반영`
  - WebSocket 연결 해제 → 재연결 후 누락 댓글 없음 (REST 폴백으로 동기화)

**Commit:** `feat(websocket): add real-time comment updates via socket.io`

---

## Task 3: 알림 실시간 (폴링 교체)

**담당:** Gemini  
**선행 조건:** Task 1 완료, Plan 10 Task 3 (notifications API) 완료

### Steps

- [ ] Step 1: `backend/src/socket/handlers/notification.handler.ts`

```typescript
// 관리자 네임스페이스 (/admin) 사용
export function emitNewNotification(adminNsp: Namespace, notification: NotificationDTO) {
  adminNsp.to(ROOMS.adminNotifications).emit('notification:new', { notification })
}
```

- [ ] Step 2: `notifications.service.ts` 수정 — `createNotification()` 후 `emitNewNotification()` 호출

- [ ] Step 3: Frontend — `useAdminSocket.ts` 훅 (관리자 전용)

```typescript
export function useAdminSocket() {
  const { token } = useAuth()
  const socket = useMemo(() => io('/admin', {
    auth: { token },
    autoConnect: !!token,
  }), [token])
  return socket
}
```

- [ ] Step 4: `NotificationBell.tsx` 수정 — **Plan 10의 30초 폴링을 제거**하고 WebSocket 이벤트로 교체

```typescript
// before: setInterval(() => fetchUnreadCount(), 30000)
// after:
socket.on('notification:new', () => {
  setUnreadCount(prev => prev + 1)
  // 또는 refetch 트리거
})
```

- [ ] Step 5: 연결 실패 시 폴백 — WebSocket 연결 안 됨 감지 시 30초 폴링으로 자동 전환

- [ ] Step 6: 테스트:
  - 새 댓글 작성 → admin 화면 bell badge 즉시 +1
  - WebSocket 연결 해제 후 재연결 → unread count 재조회

**Commit:** `feat(websocket): replace notification polling with socket.io real-time updates`

---

## Task 4: Admin Moderation Live Feed

**담당:** Gemini  
**선행 조건:** Task 1 완료, Plan 9A 완료

### 이벤트 설계

```text
서버 → 관리자 클라이언트 (/admin namespace):
  report:new        { report: ReportDTO }     새 신고 접수
  report:resolved   { reportId, action }      신고 처리 완료
  moderation:hidden { type, id, reason }      콘텐츠 숨김
```

### Steps

- [ ] Step 1: `backend/src/socket/handlers/moderation.handler.ts` — emit 헬퍼 함수들

- [ ] Step 2: Plan 9A `commentReports.service.ts`, `guestbookReports.service.ts` 수정 — 신고 생성/처리 시 emit

- [ ] Step 3: Frontend — `AdminModerationPage.tsx`에 실시간 신고 feed

```typescript
socket.on('report:new', ({ report }) => {
  // 목록 상단에 새 신고 prepend
  // 빨간 뱃지 +1
  // 토스트: "새 신고가 접수되었습니다"
})
```

- [ ] Step 4: Admin 사이드바 "Moderation" 메뉴에 실시간 badge 표시

- [ ] Step 5: 테스트:
  - 방문자 탭에서 댓글 신고 → admin 탭 moderation queue에 즉시 표시

**Commit:** `feat(websocket): add admin moderation live feed`

---

## Task 5: Analytics 트렌드 차트

**담당:** Gemini  
**선행 조건:** Plan 8 Task 7 (analytics rollup job) 완료

### 설계

Plan 8의 `daily_analytics_rollups` 테이블을 읽어 집계한다.

```text
GET /api/admin/analytics/trend?from=&to=&metric=page_views|unique_sessions|events
→ [{ date, value }]
```

### Steps

- [ ] Step 1: 차트 라이브러리 설치

```bash
npm install recharts
npm install --save-dev @types/recharts  # 필요 시
```

- [ ] Step 2: `backend/src/modules/analytics/analytics.trend.service.ts`

```typescript
async getTrend(params: {
  from: Date
  to: Date
  metric: 'page_views' | 'unique_sessions' | 'total_events'
}): Promise<{ date: string; value: number }[]>
```

SQL 예시:
```sql
SELECT
  date,
  SUM(total_events) AS total_events,
  COUNT(DISTINCT session_hash) AS unique_sessions
FROM daily_analytics_rollups
WHERE date BETWEEN ? AND ?
GROUP BY date
ORDER BY date ASC
```

> `session_hash`: Plan 8 schema에 없다면 `ip_hash`를 대용. 없는 컬럼 참조 전 schema 확인.

- [ ] Step 3: `GET /api/admin/analytics/trend` 엔드포인트 추가

- [ ] Step 4: Frontend — `AnalyticsTrendChart.tsx`

```tsx
// recharts LineChart
// x축: 날짜, y축: 방문자 수
// 날짜 범위 picker (오늘/7일/30일/90일/커스텀)
// metric 탭 전환 (페이지뷰 / 세션 / 이벤트)
```

- [ ] Step 5: `/admin/analytics` 페이지 상단에 트렌드 차트 배치

- [ ] Step 6: 데이터 없을 시 empty state — "아직 수집된 데이터가 없습니다"

**Commit:** `feat(analytics): add trend chart with recharts on admin analytics page`

---

## Task 6: Analytics 리텐션 + Funnel

**담당:** Gemini  
**선행 조건:** Task 5 완료

### 리텐션 설계

```text
7일 리텐션: 첫 방문 후 7일 이내 재방문한 세션 / 전체 첫 방문 세션
30일 리텐션: 동일 기준
```

SQL 기반 근사 계산 (`ip_hash` 기준, 정확한 코호트가 아닌 best-effort):

```sql
-- 7일 리텐션
SELECT
  COUNT(DISTINCT CASE WHEN days_since_first >= 1 AND days_since_first <= 7 THEN ip_hash END)
    / COUNT(DISTINCT ip_hash) AS retention_7d
FROM (
  SELECT
    ip_hash,
    DATEDIFF(created_at, MIN(created_at) OVER (PARTITION BY ip_hash)) AS days_since_first
  FROM analytics_events
  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 37 DAY)
    AND ip_hash IS NOT NULL
) t
```

### Funnel 설계

```text
대표 funnel: 홈 → 포트폴리오 → 포트폴리오 상세 → (연락/소셜 링크 클릭)
event_name allowlist (Plan 8 기준): page_view, showcase_view, contact_click, social_link_click
```

### Steps

- [ ] Step 1: `analytics.retention.service.ts` — 7일/30일 리텐션 계산

```typescript
async getRetention(): Promise<{ retention7d: number; retention30d: number }>
```

- [ ] Step 2: `analytics.funnel.service.ts` — 스텝별 전환율

```typescript
async getFunnel(steps: string[]): Promise<{ step: string; count: number; dropoffRate: number }[]>
```

SQL: 각 스텝별로 `COUNT(DISTINCT ip_hash WHERE event_name = ?)` → 스텝 간 비율 계산

- [ ] Step 3: `GET /api/admin/analytics/retention`, `GET /api/admin/analytics/funnel` 엔드포인트 추가

- [ ] Step 4: Frontend — `RetentionCard.tsx` — 리텐션 수치 카드 (숫자 + 설명)

```text
┌─────────────────────────────────────┐
│  7일 리텐션   30일 리텐션            │
│    23.4%        41.2%               │
│  재방문한 방문자 비율                │
└─────────────────────────────────────┘
```

- [ ] Step 5: Frontend — `FunnelChart.tsx` — 단계별 수평 bar chart

- [ ] Step 6: `ip_hash IS NULL`인 행(salt 미설정 환경)이 많을 때 "개인정보 보호 설정으로 인해 정확도가 제한될 수 있습니다" 안내

**Commit:** `feat(analytics): add retention and funnel analysis`

---

## Task 7: Analytics Referrer + 콘텐츠 랭킹

**담당:** Gemini  
**선행 조건:** Task 5 완료

### Steps

- [ ] Step 1: `analytics.referrer.service.ts`

```typescript
async getTopReferrers(params: { from: Date; to: Date; limit: number }):
  Promise<{ referrer: string; count: number; percentage: number }[]>
```

```sql
SELECT
  COALESCE(referrer, '직접 방문') AS referrer,
  COUNT(*) AS count
FROM analytics_events
WHERE event_name = 'page_view'
  AND created_at BETWEEN ? AND ?
GROUP BY referrer
ORDER BY count DESC
LIMIT ?
```

- [ ] Step 2: `analytics.content.service.ts` — 콘텐츠별 조회수 랭킹

```sql
-- route 패턴으로 콘텐츠 유형 분류
SELECT
  route,
  SUM(total_events) AS views
FROM daily_analytics_rollups
WHERE event_name = 'page_view'
  AND date BETWEEN ? AND ?
GROUP BY route
ORDER BY views DESC
LIMIT 10
```

- [ ] Step 3: `GET /api/admin/analytics/referrers`, `GET /api/admin/analytics/top-content` 엔드포인트 추가

- [ ] Step 4: Frontend — `ReferrerTable.tsx`, `TopContentTable.tsx` — 테이블 형태, 퍼센트 bar

- [ ] Step 5: `/admin/analytics` 페이지 하단에 두 테이블 배치

**Commit:** `feat(analytics): add referrer breakdown and content ranking`

---

## Task 8: react-i18next 설정 + KO 번역 파일

**담당:** Gemini  
**선행 조건:** 없음

### 설계

```text
번역 범위: UI 레이블, 버튼, 메시지, 에러 텍스트
번역 제외: DB 콘텐츠(게시글 본문, 이미지 설명) — 이건 별도 다국어 CMS 영역
기본 언어: ko
지원 언어: ko, en
언어 감지 순서: URL param (?lang=en) → localStorage → navigator.language → ko 기본
```

### Steps

- [ ] Step 1: 의존성 추가

```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

- [ ] Step 2: `frontend/src/i18n.ts` 설정

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'en'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

export default i18n
```

- [ ] Step 3: `frontend/main.tsx`에 `import './i18n'` 추가 (앱 진입 전 초기화)

- [ ] Step 4: `frontend/public/locales/ko/translation.json` 생성

```json
{
  "nav": {
    "home": "홈",
    "search": "탐색",
    "portfolio": "포트폴리오",
    "profile": "프로필",
    "notifications": "알림"
  },
  "common": {
    "loading": "불러오는 중...",
    "error": "오류가 발생했습니다",
    "retry": "다시 시도",
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "수정",
    "confirm": "확인",
    "back": "뒤로",
    "more": "더 보기",
    "empty": "아직 콘텐츠가 없습니다"
  },
  "home": {
    "title": "나의 창작 세계",
    "subtitle": "일상, 아트, 음악, 포트폴리오",
    "latestPosts": "최근 게시물",
    "featuredWork": "주요 작품"
  },
  "portfolio": {
    "title": "포트폴리오",
    "resume": "이력서",
    "showcase": "작품 전시",
    "contact": "연락하기"
  },
  "comments": {
    "placeholder": "댓글을 입력하세요...",
    "submit": "작성",
    "report": "신고",
    "reportReason": "신고 사유",
    "reportSuccess": "신고가 접수되었습니다",
    "empty": "첫 번째 댓글을 남겨보세요"
  },
  "guestbook": {
    "title": "방명록",
    "placeholder": "방문 인사를 남겨주세요...",
    "submit": "작성",
    "empty": "아직 방명록이 없습니다"
  },
  "search": {
    "placeholder": "검색어를 입력하세요",
    "minLength": "2자 이상 입력해주세요",
    "noResults": "검색 결과가 없습니다",
    "resultsFor": "\"{{query}}\" 검색 결과"
  },
  "notifications": {
    "empty": "알림이 없습니다",
    "markAllRead": "전체 읽음",
    "viewAll": "전체 보기"
  },
  "pwa": {
    "installTitle": "CrocHub를 홈 화면에 추가하세요",
    "installButton": "추가하기",
    "iosInstructions": "Safari에서 공유 버튼 → '홈 화면에 추가'를 탭하세요",
    "updateAvailable": "새 버전이 있습니다",
    "updateButton": "지금 업데이트",
    "offline": "인터넷 연결이 없습니다"
  },
  "admin": {
    "dashboard": "대시보드",
    "content": "콘텐츠 관리",
    "moderation": "신고 관리",
    "analytics": "분석",
    "tags": "태그 관리",
    "collections": "컬렉션 관리",
    "settings": "설정"
  },
  "errors": {
    "notFound": "페이지를 찾을 수 없습니다",
    "serverError": "서버 오류가 발생했습니다",
    "unauthorized": "로그인이 필요합니다",
    "forbidden": "접근 권한이 없습니다"
  }
}
```

- [ ] Step 5: 주요 컴포넌트에 `useTranslation()` 훅 적용 시작 (nav, common buttons부터)

```tsx
const { t } = useTranslation()
// before: <span>홈</span>
// after:  <span>{t('nav.home')}</span>
```

**Commit:** `feat(i18n): add react-i18next setup with Korean translation file`

---

## Task 9: EN 번역 파일 + 언어 전환 UI

**담당:** Gemini  
**선행 조건:** Task 8 완료

### Steps

- [ ] Step 1: `frontend/public/locales/en/translation.json` 생성

```json
{
  "nav": {
    "home": "Home",
    "search": "Explore",
    "portfolio": "Portfolio",
    "profile": "Profile",
    "notifications": "Notifications"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm",
    "back": "Back",
    "more": "Show more",
    "empty": "No content yet"
  },
  "home": {
    "title": "My Creative World",
    "subtitle": "Daily life, Art, Music & Portfolio",
    "latestPosts": "Latest Posts",
    "featuredWork": "Featured Work"
  },
  "portfolio": {
    "title": "Portfolio",
    "resume": "Resume",
    "showcase": "Showcase",
    "contact": "Contact"
  },
  "comments": {
    "placeholder": "Leave a comment...",
    "submit": "Post",
    "report": "Report",
    "reportReason": "Reason for report",
    "reportSuccess": "Report submitted",
    "empty": "Be the first to comment"
  },
  "guestbook": {
    "title": "Guestbook",
    "placeholder": "Leave a message...",
    "submit": "Submit",
    "empty": "No entries yet"
  },
  "search": {
    "placeholder": "Search...",
    "minLength": "Please enter at least 2 characters",
    "noResults": "No results found",
    "resultsFor": "Results for \"{{query}}\""
  },
  "notifications": {
    "empty": "No notifications",
    "markAllRead": "Mark all as read",
    "viewAll": "View all"
  },
  "pwa": {
    "installTitle": "Add CrocHub to Home Screen",
    "installButton": "Add",
    "iosInstructions": "In Safari, tap the Share button then 'Add to Home Screen'",
    "updateAvailable": "A new version is available",
    "updateButton": "Update now",
    "offline": "No internet connection"
  },
  "errors": {
    "notFound": "Page not found",
    "serverError": "Server error occurred",
    "unauthorized": "Login required",
    "forbidden": "Access denied"
  }
}
```

- [ ] Step 2: `LanguageSwitcher.tsx` 컴포넌트

```tsx
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : 'ko'

  return (
    <button
      onClick={() => i18n.changeLanguage(current === 'ko' ? 'en' : 'ko')}
      className="text-sm font-medium text-lavender-300 hover:text-lavender-100 transition"
      aria-label="언어 전환 / Switch language"
    >
      {current === 'ko' ? 'EN' : 'KO'}
    </button>
  )
}
```

- [ ] Step 3: Public 헤더 우측에 `LanguageSwitcher` 삽입

- [ ] Step 4: `lang` attribute 동기화 — 언어 변경 시 `document.documentElement.lang` 업데이트

```typescript
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng.startsWith('en') ? 'en' : 'ko'
})
```

- [ ] Step 5: Suspense 처리 — 번역 파일 로딩 중 fallback

```tsx
// App.tsx
<Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
  <RouterProvider router={router} />
</Suspense>
```

- [ ] Step 6: 테스트:
  - `EN` 클릭 → 모든 UI 텍스트 영문 전환
  - 새로고침 후 선택 언어 유지 (localStorage)
  - `?lang=en` URL param으로 영문 강제 적용

**Commit:** `feat(i18n): add English translation file and language switcher`

---

## Task 10: 포트폴리오 EN 메타 태그

**담당:** Gemini  
**선행 조건:** Task 9 완료

### 목적

해외 학교 입시 담당자가 포트폴리오 링크를 공유하면 영문 Open Graph 미리보기가 표시되어야 한다.

### Steps

- [ ] Step 1: `frontend/src/hooks/useDocumentMeta.ts` 확장 — 현재 언어 기반 meta 설정

```typescript
export function useDocumentMeta({ ko, en }: { ko: MetaData; en: MetaData }) {
  const { i18n } = useTranslation()
  const meta = i18n.language.startsWith('en') ? en : ko

  useEffect(() => {
    document.title = meta.title
    setMetaTag('description', meta.description)
    setOGTag('og:title', meta.title)
    setOGTag('og:description', meta.description)
    setOGTag('og:locale', i18n.language.startsWith('en') ? 'en_US' : 'ko_KR')
    setOGTag('og:locale:alternate', i18n.language.startsWith('en') ? 'ko_KR' : 'en_US')
  }, [meta, i18n.language])
}
```

- [ ] Step 2: 포트폴리오 페이지에 적용

```tsx
useDocumentMeta({
  ko: {
    title: '포트폴리오 — CrocHub',
    description: '드로잉, 음악, 글쓰기. 나의 창작 아카이브.'
  },
  en: {
    title: 'Portfolio — CrocHub',
    description: 'Drawing, music, writing. My creative archive.'
  }
})
```

- [ ] Step 3: 홈, 프로필, 작품 상세 페이지에도 동일 적용

- [ ] Step 4: `<html lang>` 설정 확인 (Task 9 Step 4에서 이미 처리됨)

- [ ] Step 5: 소셜 미리보기 테스트 — Open Graph Debugger (ogp.me)로 영문/한국어 전환 후 미리보기 확인

**Commit:** `feat(i18n): add bilingual meta tags and OG data for portfolio pages`

---

## Task 11: Error Boundary + 404/500 페이지

**담당:** Gemini  
**선행 조건:** Task 8 완료 (t() 함수 사용 가능)

### Steps

- [ ] Step 1: `frontend/src/components/ErrorBoundary.tsx`

```tsx
import { Component, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
    // Plan 8 analytics에 에러 이벤트 전송 (선택)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback />
    }
    return this.props.children
  }
}
```

- [ ] Step 2: `DefaultErrorFallback.tsx` — 크로코다일 일러스트 + 에러 메시지 + "홈으로" 버튼

- [ ] Step 3: `frontend/src/pages/NotFoundPage.tsx` (404) — 라벤더 퍼플 테마, 귀여운 메시지

```text
"404 — 이 페이지는 강 아래로 가라앉은 것 같아요 🐊"
[홈으로 돌아가기]
```

- [ ] Step 4: React Router에 catch-all route 추가

```tsx
{ path: '*', element: <NotFoundPage /> }
```

- [ ] Step 5: Express 전역 에러 핸들러 확인/강화

```typescript
// backend/src/middleware/errorHandler.ts
app.use((err, req, res, next) => {
  const status = err.status ?? 500
  const isProd = process.env.NODE_ENV === 'production'
  res.status(status).json({
    error: isProd && status === 500 ? 'Internal server error' : err.message,
    ...(isProd ? {} : { stack: err.stack })
  })
})
```

- [ ] Step 6: Route-level Error Boundary — 주요 페이지 컴포넌트를 `<ErrorBoundary>`로 감싸기

**Commit:** `feat(ux): add error boundary, 404 page, and global error handler`

---

## Task 12: 의존성 보안 감사 자동화

**담당:** Codex  
**선행 조건:** Task 11 완료

### Steps

- [ ] Step 1: `.github/workflows/security-audit.yml` 생성

```yaml
name: Security Audit
on:
  push:
    branches: [main, dev]
  schedule:
    - cron: '0 9 * * 1'   # 매주 월요일 09:00 UTC

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      - name: Frontend audit
        working-directory: frontend
        run: npm ci && npm audit --audit-level=high

      - name: Backend audit
        working-directory: backend
        run: npm ci && npm audit --audit-level=high

      - name: Dependency review (PRs only)
        if: github.event_name == 'pull_request'
        uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
```

- [ ] Step 2: `package.json`에 감사 스크립트 추가

```json
"scripts": {
  "audit:fix": "npm audit fix",
  "audit:report": "npm audit --json > audit-report.json"
}
```

- [ ] Step 3: 현재 `npm audit` 결과 기준선 확보 — high/critical 취약점 0개 목표, moderate는 허용하되 이슈 등록

- [ ] Step 4: `dependabot.yml` 설정 (이미 없다면)

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /frontend
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
  - package-ecosystem: npm
    directory: /backend
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
```

**Commit:** `ci: add weekly security audit workflow and dependabot config`

---

## Task 13: 최종 E2E + 졸업 체크리스트

**담당:** Codex  
**선행 조건:** Task 1~12 완료

### E2E 추가 테스트

- [ ] Step 1: WebSocket 통합 테스트

```text
- 댓글 작성 → 다른 클라이언트에 즉시 반영
- 소켓 재연결 후 상태 일관성
- 관리자 소켓 인증 실패 시 연결 거부
```

- [ ] Step 2: i18n E2E

```text
- 언어 전환 후 모든 nav/button 텍스트 변경 확인
- ?lang=en URL로 영문 페이지 로드
- OG 메타 태그 언어별 확인
```

- [ ] Step 3: Analytics 데이터 무결성

```text
- 페이지뷰 이벤트 → daily_analytics_rollups 집계 후 trend API 반환 확인
- ip_hash=null 환경에서 retention API 안전하게 응답 (0% 반환, 에러 없음)
```

---

### 최종 졸업 체크리스트

플랫폼을 "완성"으로 선언하기 전에 아래 항목을 모두 확인한다.

#### 기능 완성도

```text
✓ Plan 1–12 모든 완료 기준 충족
✓ 홈 피드, 포트폴리오, 검색, 방명록, 댓글 정상 동작
✓ 관리자 로그인 + 콘텐츠/모더레이션/분석/설정 전 기능 동작
✓ PWA: 오프라인 fallback, install prompt, 실시간 댓글/알림
✓ 모바일 앱 (Capacitor): iOS/Android 빌드 성공
✓ 이메일 다이제스트 dry-run 발송 성공
✓ 한국어 검색 (ngram) + 영문 UI 전환 동작
```

#### 성능

```text
✓ Lighthouse (데스크탑): Performance 90+, Accessibility 95+, SEO 90+
✓ Lighthouse (모바일): Performance 70+
✓ 첫 페이지 LCP < 2.5초 (3G 기준)
✓ 이미지 전부 lazy load + WebP + srcset
```

#### 보안

```text
✓ npm audit high/critical 0건
✓ .env 파일 미커밋 확인 (git log --all -- .env)
✓ HTTPS 적용 (Cloudflare 또는 Let's Encrypt)
✓ CSP 헤더 설정
✓ Rate limiting 전체 엔드포인트 적용 확인
✓ SQL injection: 검색/댓글 API 수동 테스트
✓ XSS: 댓글/방명록 HTML escape 확인
```

#### 운영 준비

```text
✓ Docker Compose production 설정 (NODE_ENV=production)
✓ DB 자동 백업 스크립트 (Plan 8) cron 동작 확인
✓ Analytics rollup job 매일 실행 확인
✓ Email digest job 매주 실행 확인
✓ 로그 파일 rotation 설정 (logrotate 또는 Docker logging driver)
✓ AUDIT_IP_HASH_SALT 환경 변수 설정 확인
✓ GitHub Actions CI: lint + test + build 전부 green
✓ App Store / Play Store 내부 배포 (internal track) 완료
```

#### 문서

```text
✓ README.md — 로컬 설치/실행 방법
✓ CLAUDE.md / 설계 스펙 최신 상태
✓ API contract 문서 (Plan 3 기준 + Plan 9A, 10, 11, 12 업데이트)
✓ APNs 인증서 만료일 캘린더 등록
```

**Commit:** `test(plan12): final e2e pass and graduation checklist verification`

---

## Plan 12 완료 기준

```text
✓ Socket.IO 서버 동작, 관리자 namespace 인증 통과
✓ 댓글 작성 후 다른 탭에 < 1초 내 반영
✓ 알림 badge 30초 폴링 제거 → WebSocket 실시간 교체
✓ Admin moderation 신고 접수 즉시 live feed
✓ Analytics 트렌드 차트 (일별/주별/월별) 렌더링
✓ 리텐션 7일/30일 수치 카드 표시
✓ Funnel 3단계 이상 전환율 차트
✓ referrer 상위 5개, 콘텐츠 조회수 top 10 표시
✓ react-i18next 설정 완료, KO/EN 번역 파일 90%+ 커버리지
✓ 언어 전환 버튼 동작 + localStorage 유지
✓ 포트폴리오 페이지 EN OG 메타 태그 확인
✓ Error Boundary + 404 페이지 동작
✓ npm audit high/critical 0건 CI 통과
✓ 졸업 체크리스트 전 항목 확인 완료
```
