# CrocHub — Plan 6: Admin Advanced Operations + PWA Management 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~3 Backend Core/API Contract 완료 + Plan 4 Frontend Foundation/Public Pages 완료 + Plan 5 Admin Dashboard/Content Management 완료

**Goal:** Plan 5에서 만든 관리자 영역을 “운영 고급 기능”까지 확장한다. 관리자는 홈 화면 섹션 배치, 일정 캘린더, 미디어 타입 설정, 푸시 알림 발송, dashboard aggregate 지표, 전체 댓글 필터링을 관리할 수 있고, 사용자는 PWA 설치 및 푸시 권한 UX를 자연스럽게 경험한다.

**중요:** Plan 6는 관리자 고급 운영 기능과 PWA 운영 경험을 함께 다루므로 frontend/backend/API contract 변경이 모두 발생할 수 있다. 단, 기존 Plan 3 API 계약과 Plan 5 관리자 API 계층을 깨지 않고 additive 방식으로 확장한다.

**Architecture:**
- Frontend는 Plan 5의 `/admin` shell, `adminApi.ts`, 공통 admin component를 재사용한다.
- Backend는 기존 Express 모듈형 모놀리스 구조를 유지하고, admin 전용 aggregate/comment endpoint는 `backend/src/modules/admin` 안에서 확장한다.
- PWA install/push permission UX는 public layout 또는 app shell에서 제공하고, 실제 push subscription 저장은 기존 `/api/push/subscribe` 정책(user+)을 유지한다.
- 모든 관리자 mutation은 `role=admin` 전용으로 보호한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + React Router + Express + Prisma + MySQL + Web Push API + Workbox/PWA tooling

---

## Plan 6 범위

이번 Plan의 확정 범위:

```text
/admin/layout        홈 화면 섹션 배치 편집
/admin/schedule      개인 일정 캘린더 CRUD
/admin/settings      미디어 타입 설정 UI
/admin/push          관리자 푸시 알림 발송 UI 또는 settings 하위 tab
/admin/dashboard     전용 aggregate API 연동
/admin/comments      전체 댓글 목록/필터링 API 고도화 연동
PWA                  install prompt + push permission UX 개선
```

이번 Plan에서 하지 않는 것:

```text
이력서/포트폴리오 자동 생성
다국어 관리 CMS
복잡한 drag-and-drop page builder
실시간 websocket notification
관리자 다중 권한/role 세분화
게스트 push subscription 저장 정책 변경
```

---

## Backend API 확장 제안

Plan 6에서는 다음 API를 추가하거나 기존 API를 관리자 UI에 맞게 보강한다.

```text
Dashboard
GET    /api/admin/dashboard                  admin

Admin Comments
GET    /api/admin/comments?page=&limit=&postId=&status=&q= admin
PATCH  /api/admin/comments/:id/hidden        admin

Layout
GET    /api/layout                           public
PUT    /api/layout                           admin

Schedules
GET    /api/schedules?month=YYYY-MM          public
POST   /api/schedules                        admin
PUT    /api/schedules/:id                    admin
DELETE /api/schedules/:id                    admin

Settings / Media Types
GET    /api/admin/media-types                admin
PUT    /api/admin/media-types/:id            admin

Push
GET    /api/push/vapid-public-key            public 또는 user+
POST   /api/push/subscribe                   user+
POST   /api/push/send                        admin
```

**주의:** `GET /api/layout`, schedules, media-types, push subscribe/send는 Plan 3에 이미 정의되어 있으므로 Plan 6에서는 프론트 UI와 누락된 backend validation/test만 보강한다.

---

## 파일 구조 맵

Plan 5 구조를 유지하면서 아래 파일을 추가/수정한다.

```text
frontend/
├── src/
│   ├── App.tsx 또는 router.tsx
│   ├── lib/
│   │   ├── adminApi.ts                         # Plan 6 admin query/mutation 추가
│   │   ├── pwa.ts                              # install/push permission helper
│   │   └── pushApi.ts                          # public/user push subscription client
│   ├── types/
│   │   ├── admin.ts                            # dashboard/comment/layout/settings 타입 추가
│   │   └── pwa.ts
│   ├── hooks/
│   │   ├── useAdminDashboard.ts
│   │   ├── useAdminLayout.ts
│   │   ├── useAdminSchedule.ts
│   │   ├── useAdminSettings.ts
│   │   ├── useAdminPush.ts
│   │   ├── usePwaInstallPrompt.ts
│   │   └── usePushPermission.ts
│   ├── components/
│   │   ├── admin/
│   │   │   ├── LayoutSectionEditor.tsx
│   │   │   ├── LayoutPostPicker.tsx
│   │   │   ├── ScheduleCalendar.tsx
│   │   │   ├── ScheduleEventForm.tsx
│   │   │   ├── MediaTypeSettingsTable.tsx
│   │   │   ├── PushComposer.tsx
│   │   │   └── DashboardMetricGrid.tsx
│   │   └── pwa/
│   │       ├── PwaInstallBanner.tsx
│   │       ├── PushPermissionBanner.tsx
│   │       └── NotificationOptInCard.tsx
│   └── pages/
│       └── admin/
│           ├── AdminDashboardPage.tsx          # aggregate API 사용하도록 개선
│           ├── AdminLayoutPage.tsx
│           ├── AdminSchedulePage.tsx
│           ├── AdminSettingsPage.tsx
│           ├── AdminPushPage.tsx               # 별도 route 선택 시
│           └── AdminCommentsPage.tsx           # 전체 댓글 API 사용하도록 개선

backend/
├── src/
│   ├── modules/
│   │   ├── admin/
│   │   │   ├── admin.router.ts                 # dashboard/comments endpoint 추가
│   │   │   ├── admin.service.ts
│   │   │   └── admin.types.ts
│   │   ├── layout/
│   │   ├── schedule/
│   │   └── push/
│   └── lib/
│       └── validation.ts
├── tests/
│   ├── admin.dashboard.test.ts
│   ├── admin.comments.test.ts
│   ├── layout.test.ts
│   ├── schedule.test.ts
│   └── push.test.ts

docs/
└── superpowers/
    └── api/
        └── 2026-05-06-backend-api-contract.md
```

---

## UX / Design 기준

- 기존 Plan 5 Admin shell을 그대로 사용한다.
- 고급 기능은 “한 화면에서 바로 이해되는 운영 도구”로 만든다.
- Layout/Schedule은 시각적 편집 기능이 많으므로 empty/loading/error state를 명확히 분리한다.
- PWA 안내는 방해가 되지 않아야 한다. 사용자가 닫으면 일정 기간 다시 보이지 않게 localStorage에 저장한다.
- Push permission은 브라우저 권한 정책상 사용자 gesture 안에서만 요청한다.

---

## Route 설계

```text
/admin                         Dashboard, aggregate metrics
/admin/layout                  홈 화면 섹션 배치 편집
/admin/schedule                개인 일정 캘린더 CRUD
/admin/settings                미디어 타입 설정
/admin/push                    푸시 알림 발송 UI (또는 /admin/settings?tab=push)
/admin/comments                전체 댓글 목록/필터링/숨김/답변
```

Public/PWA 관련 UI는 기존 public layout에 통합한다.

```text
/                              PWA install banner 노출 후보
/profile                       notification opt-in card 노출 후보
/post/:id                      댓글 답변 push 유도 후보
```

---

## Task 1: Plan 5 결과 확인 및 라우트 확장 준비

**Files:**
- Inspect/Modify: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Inspect/Modify: `frontend/src/components/admin/AdminLayout.tsx`
- Inspect/Modify: `frontend/src/components/admin/AdminNav.tsx`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: Plan 5 관리자 구조 확인**

```bash
find frontend/src -maxdepth 4 -type f | sort
cat frontend/package.json
```

Expected:
- `/admin` 보호 라우트 존재
- `AdminLayout` / `AdminNav` 존재
- `adminApi.ts` 또는 동등 관리자 API 파일 존재

- [ ] **Step 2: admin nav에 고급 운영 메뉴 추가**

```text
Layout → /admin/layout
Schedule → /admin/schedule
Settings → /admin/settings
Push → /admin/push 또는 Settings tab
```

- [ ] **Step 3: route placeholder 추가**

아직 구현 전이라도 “준비 중” 페이지가 아닌 실제 Task별 페이지 component를 생성하고 route를 연결한다.

- [ ] **Step 4: API 타입 baseline 확장**

`AdminDashboardSummary`, `AdminCommentListItem`, `LayoutSection`, `ScheduleItem`, `MediaTypeConfig`, `PushSendRequest` 타입을 정의한다.

- [ ] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(admin): prepare advanced operations routes"
```

---

## Task 2: 관리자 Dashboard 전용 Aggregate API 구현

**Files:**
- Modify: `backend/src/modules/admin/admin.router.ts`
- Modify: `backend/src/modules/admin/admin.service.ts`
- Modify: `backend/src/modules/admin/admin.types.ts`
- Create: `backend/tests/admin.dashboard.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: endpoint 추가**

```text
GET /api/admin/dashboard admin
```

- [ ] **Step 2: response shape 정의**

```json
{
  "metrics": {
    "postsTotal": 0,
    "publishedPosts": 0,
    "draftPosts": 0,
    "mediaTotal": 0,
    "usersTotal": 0,
    "commentsTotal": 0,
    "hiddenComments": 0,
    "schedulesThisMonth": 0,
    "pushSubscriptions": 0
  },
  "recentPosts": [],
  "recentMedia": [],
  "recentComments": [],
  "recentUsers": []
}
```

- [ ] **Step 3: Prisma aggregate 구현**

주의:
- N+1 query를 피한다.
- count는 필요한 테이블별 `_count` 또는 `count()`로 계산한다.
- recent 목록은 limit 5로 제한한다.

- [ ] **Step 4: 권한 테스트 작성**

```text
GET /api/admin/dashboard without token -> 401
GET /api/admin/dashboard as user -> 403
GET /api/admin/dashboard as admin -> 200
```

- [ ] **Step 5: API contract 업데이트**

Admin 섹션에 dashboard endpoint와 response type을 추가한다.

- [ ] **Step 6: 확인**

```bash
cd backend
npm test -- tests/admin.dashboard.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/admin backend/tests/admin.dashboard.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(admin): add dashboard aggregate API"
```

---

## Task 3: 관리자 Dashboard UI를 Aggregate API로 개선

**Files:**
- Modify: `frontend/src/pages/admin/AdminDashboardPage.tsx`
- Create/Modify: `frontend/src/components/admin/DashboardMetricGrid.tsx`
- Create: `frontend/src/hooks/useAdminDashboard.ts`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: adminApi 함수 추가**

```typescript
getAdminDashboard(): Promise<AdminDashboardSummary>
```

- [ ] **Step 2: 기존 조합 호출 제거**

Plan 5 dashboard가 `GET /api/posts`, `GET /api/media`, `GET /api/admin/users`를 각각 호출했다면 `GET /api/admin/dashboard` 단일 호출로 대체한다.

- [ ] **Step 3: metric grid 구현**

표시 후보:
- 전체/공개/임시글
- 미디어 수
- 사용자 수
- 댓글/숨김 댓글 수
- 이번 달 일정 수
- 푸시 구독 수

- [ ] **Step 4: recent activity 개선**

recentPosts, recentMedia, recentComments, recentUsers를 aggregate response에서 렌더링한다.

- [ ] **Step 5: loading/error/empty state 확인**

dashboard 전체 로딩 + 섹션별 fallback을 적용한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminDashboardPage.tsx frontend/src/components/admin/DashboardMetricGrid.tsx frontend/src/hooks/useAdminDashboard.ts frontend/src/lib/adminApi.ts frontend/src/types/admin.ts
git commit -m "feat(admin): use aggregate dashboard metrics"
```

---

## Task 4: 전체 댓글 목록/필터링 관리자 API 고도화

**Files:**
- Modify: `backend/src/modules/admin/admin.router.ts`
- Modify: `backend/src/modules/admin/admin.service.ts`
- Modify: `backend/src/modules/admin/admin.types.ts`
- Create: `backend/tests/admin.comments.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: 전체 댓글 목록 endpoint 추가**

```text
GET /api/admin/comments?page=&limit=&postId=&status=&q=
```

Query 규칙:
- `page`: positive integer, default 1
- `limit`: positive integer, max 100, default 20
- `postId`: optional positive integer
- `status`: optional `visible | hidden | all`, default all
- `q`: optional string, max 100

- [ ] **Step 2: response shape 정의**

```json
{
  "data": [
    {
      "id": 1,
      "postId": 1,
      "postTitle": "글 제목",
      "author": { "id": 2, "nickname": "방문자", "email": "user@example.com" },
      "body": "댓글 내용",
      "reply": "관리자 답변",
      "isHidden": false,
      "createdAt": "2026-05-06T00:00:00.000Z"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

- [ ] **Step 3: hidden 상태 변경 endpoint 추가**

```text
PATCH /api/admin/comments/:id/hidden
```

Request:

```json
{ "isHidden": true }
```

- [ ] **Step 4: 기존 reply endpoint와 정책 정리**

`PUT /api/comments/:id/reply`는 유지한다. Admin comments 화면에서는 reply 저장은 기존 endpoint를 사용하고, hide/unhide만 새 admin endpoint를 사용한다.

- [ ] **Step 5: 테스트 작성**

```text
GET /api/admin/comments as admin -> 200 paginated
GET /api/admin/comments?status=hidden -> hidden only
GET /api/admin/comments?postId=bad -> 400 VALIDATION_ERROR
PATCH /api/admin/comments/:id/hidden as user -> 403
PATCH /api/admin/comments/:id/hidden as admin -> 200
```

- [ ] **Step 6: 확인**

```bash
cd backend
npm test -- tests/admin.comments.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/admin backend/tests/admin.comments.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(admin): add comment moderation APIs"
```

---

## Task 5: 댓글 관리 화면을 전체 댓글 API로 개선

**Files:**
- Modify: `frontend/src/pages/admin/AdminCommentsPage.tsx`
- Create/Modify: `frontend/src/hooks/useAdminComments.ts`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: adminApi 함수 추가**

```typescript
getAdminComments(params)
setAdminCommentHidden(id, isHidden)
replyToComment(id, reply)
```

- [ ] **Step 2: 필터 UI 구현**

필터:
- status: all/visible/hidden
- postId: optional
- q: body/reply 검색
- pagination

- [ ] **Step 3: 댓글 table/card 구현**

표시:
- 댓글 본문
- 게시물 제목 link
- 작성자
- 답변 상태
- hidden 상태
- 작성일
- actions: reply, hide, unhide

- [ ] **Step 4: inline reply UX 개선**

기존 Plan 5 reply UX를 유지하되 전체 댓글 목록에서도 동일하게 동작하게 한다.

- [ ] **Step 5: hide/unhide UX 구현**

`숨김 처리`와 `숨김 해제`를 별도 destructive/secondary action으로 구분한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminCommentsPage.tsx frontend/src/hooks/useAdminComments.ts frontend/src/lib/adminApi.ts frontend/src/types/admin.ts
git commit -m "feat(admin): improve comment moderation screen"
```

---

## Task 6: `/admin/layout` 홈 화면 섹션 배치 편집

**Files:**
- Create: `frontend/src/pages/admin/AdminLayoutPage.tsx`
- Create: `frontend/src/components/admin/LayoutSectionEditor.tsx`
- Create: `frontend/src/components/admin/LayoutPostPicker.tsx`
- Create: `frontend/src/hooks/useAdminLayout.ts`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`
- Optional Modify: `backend/src/modules/layout/*`
- Optional Modify: `backend/tests/layout.test.ts`

- [ ] **Step 1: 현재 layout API 확인**

```text
GET /api/layout public
PUT /api/layout admin
```

Request body:

```json
[
  {
    "sectionKey": "hero",
    "postIds": [1, 2],
    "order": 0,
    "isVisible": true
  }
]
```

- [ ] **Step 2: 섹션 편집 UI 구현**

기본 section 후보:
- hero
- featured
- latest
- creative
- blog
- study

기능:
- section visible toggle
- section order 변경(up/down 버튼 우선, drag-and-drop은 선택)
- section별 postIds 편집

- [ ] **Step 3: 게시물 선택 UI 구현**

`GET /api/posts?limit=50`을 사용해서 post picker를 구성한다.

기능:
- category filter
- selected posts reorder
- remove selected post
- public post preview link

- [ ] **Step 4: 저장/취소 플로우**

- dirty state 표시
- 저장 전 validation
- `PUT /api/layout` 성공 시 toast/notice
- 실패 시 `INVALID_POST_IDS`, `VALIDATION_ERROR` 처리

- [ ] **Step 5: backend 보강 여부 확인**

Plan 3에서 layout validation이 완료되어 있다면 backend 변경 없이 진행한다. 부족하면 다음 테스트를 보강한다.

```text
PUT /api/layout with non-existing post id -> 400 INVALID_POST_IDS
PUT /api/layout as user -> 403
```

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

backend 변경 시:

```bash
cd backend
npm test -- tests/layout.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminLayoutPage.tsx frontend/src/components/admin/LayoutSectionEditor.tsx frontend/src/components/admin/LayoutPostPicker.tsx frontend/src/hooks/useAdminLayout.ts frontend/src/lib/adminApi.ts frontend/src/types/admin.ts backend/src/modules/layout backend/tests/layout.test.ts
git commit -m "feat(admin): add homepage layout editor"
```

---

## Task 7: `/admin/schedule` 개인 일정 캘린더 CRUD

**Files:**
- Create: `frontend/src/pages/admin/AdminSchedulePage.tsx`
- Create: `frontend/src/components/admin/ScheduleCalendar.tsx`
- Create: `frontend/src/components/admin/ScheduleEventForm.tsx`
- Create: `frontend/src/hooks/useAdminSchedule.ts`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`
- Optional Modify: `backend/src/modules/schedule/*`
- Optional Modify: `backend/tests/schedule.test.ts`

- [ ] **Step 1: schedule API 확인**

```text
GET    /api/schedules?month=YYYY-MM public
POST   /api/schedules               admin
PUT    /api/schedules/:id           admin
DELETE /api/schedules/:id           admin
```

- [ ] **Step 2: 월간 캘린더 UI 구현**

기능:
- 이전/다음 월 이동
- 오늘 버튼
- 월별 일정 fetch
- 일정 색상 표시
- 모바일에서는 list view fallback 제공

- [ ] **Step 3: 일정 작성/수정 form 구현**

필드:
- title: required, max 120
- description: optional
- startAt/endAt: datetime-local
- color: hex color

- [ ] **Step 4: 날짜 validation UX**

프론트에서 먼저 검증:
- endAt은 startAt보다 늦어야 함
- color는 hex
- backend `VALIDATION_ERROR` details 표시

- [ ] **Step 5: 삭제 플로우 구현**

Confirm dialog 후 `DELETE /api/schedules/:id` 호출.

- [ ] **Step 6: backend 보강 여부 확인**

Plan 3 schedule validation이 완료되어 있으면 backend 변경 없이 진행한다. timezone/ISO 변환 문제가 있으면 테스트를 추가한다.

- [ ] **Step 7: 확인**

```bash
cd frontend
npm run build
```

backend 변경 시:

```bash
cd backend
npm test -- tests/schedule.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/admin/AdminSchedulePage.tsx frontend/src/components/admin/ScheduleCalendar.tsx frontend/src/components/admin/ScheduleEventForm.tsx frontend/src/hooks/useAdminSchedule.ts frontend/src/lib/adminApi.ts frontend/src/types/admin.ts backend/src/modules/schedule backend/tests/schedule.test.ts
git commit -m "feat(admin): add schedule calendar management"
```

---

## Task 8: `/admin/settings` 미디어 타입 설정 UI

**Files:**
- Create: `frontend/src/pages/admin/AdminSettingsPage.tsx`
- Create: `frontend/src/components/admin/MediaTypeSettingsTable.tsx`
- Create: `frontend/src/hooks/useAdminSettings.ts`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`
- Optional Modify: `backend/src/modules/admin/*`
- Optional Modify: `backend/tests/admin.test.ts`

- [ ] **Step 1: media type API 확인**

```text
GET /api/admin/media-types
PUT /api/admin/media-types/:id
```

- [ ] **Step 2: 설정 table 구현**

컬럼:
- MIME type
- category
- maxSizeMb
- isAllowed
- updated status
- action/save

- [ ] **Step 3: inline edit 구현**

- maxSizeMb input: 1~1000
- isAllowed toggle
- 변경된 row만 저장
- 저장 중 row-level loading 표시

- [ ] **Step 4: validation/error 처리**

```text
maxSizeMb=0 → 입력 오류
empty body → 저장 버튼 disabled
VALIDATION_ERROR → row error 표시
```

- [ ] **Step 5: settings page tab 구조 준비**

향후 settings에 profile/site/push가 들어갈 수 있도록 tab shell을 만든다.

초기 tab:
- Media Types
- Push Defaults 또는 Push는 `/admin/push` 링크

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

backend 변경 시:

```bash
cd backend
npm test -- tests/admin.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminSettingsPage.tsx frontend/src/components/admin/MediaTypeSettingsTable.tsx frontend/src/hooks/useAdminSettings.ts frontend/src/lib/adminApi.ts frontend/src/types/admin.ts backend/src/modules/admin backend/tests/admin.test.ts
git commit -m "feat(admin): add media type settings UI"
```

---

## Task 9: 관리자 푸시 알림 발송 UI

**Files:**
- Create: `frontend/src/pages/admin/AdminPushPage.tsx`
- Create: `frontend/src/components/admin/PushComposer.tsx`
- Create: `frontend/src/hooks/useAdminPush.ts`
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`
- Optional Modify: `backend/src/modules/push/*`
- Optional Modify: `backend/tests/push.test.ts`

- [ ] **Step 1: push send API 확인**

```text
POST /api/push/send admin
```

Request:

```json
{
  "title": "푸시 제목",
  "body": "푸시 내용",
  "url": "/post/1"
}
```

- [ ] **Step 2: PushComposer 작성**

필드:
- title: required, max 120
- body: required, max 500
- url: optional, 내부 경로만 허용(`/...`)

- [ ] **Step 3: preview card 구현**

모바일 notification 느낌의 preview를 제공한다.

- [ ] **Step 4: 발송 전 확인 dialog**

푸시는 즉시 사용자에게 발송되므로 confirm dialog를 필수로 둔다.

확인 문구:

```text
이 알림을 구독자에게 발송할까요? 발송 후 취소할 수 없습니다.
```

- [ ] **Step 5: 발송 결과 표시**

`{ "sent": number }`를 받아 성공 발송 수를 표시한다.

- [ ] **Step 6: backend 보강 여부 확인**

Plan 3에서 외부 URL을 금지했다면 그대로 유지한다. 누락되어 있으면 테스트 추가:

```text
POST /api/push/send with external url -> 400 VALIDATION_ERROR
POST /api/push/send as user -> 403
```

- [ ] **Step 7: 확인**

```bash
cd frontend
npm run build
```

backend 변경 시:

```bash
cd backend
npm test -- tests/push.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/pages/admin/AdminPushPage.tsx frontend/src/components/admin/PushComposer.tsx frontend/src/hooks/useAdminPush.ts frontend/src/lib/adminApi.ts frontend/src/types/admin.ts backend/src/modules/push backend/tests/push.test.ts
git commit -m "feat(admin): add push notification composer"
```

---

## Task 10: PWA Install UX 개선

**Files:**
- Modify: `frontend/src/main.tsx` 또는 app shell 파일
- Create: `frontend/src/lib/pwa.ts`
- Create: `frontend/src/hooks/usePwaInstallPrompt.ts`
- Create: `frontend/src/components/pwa/PwaInstallBanner.tsx`
- Modify: `frontend/src/components/layout/*` 또는 public layout 파일
- Modify: `frontend/public/manifest.json` if needed

- [x] **Step 1: manifest 확인**

필수 확인:
- name / short_name
- icons
- theme_color
- background_color
- display standalone
- start_url

- [x] **Step 2: beforeinstallprompt hook 구현**

`beforeinstallprompt` event를 저장하고 사용자 버튼 클릭 시 prompt를 호출한다.

- [x] **Step 3: install banner UI 구현**

노출 조건:
- 설치 가능 event 존재
- standalone 모드가 아님
- 사용자가 최근 닫지 않음

- [x] **Step 4: dismiss 정책 구현**

localStorage key 예시:

```text
crochub:pwa-install-dismissed-at
```

닫은 뒤 7일간 다시 표시하지 않는다.

- [x] **Step 5: iOS 안내 fallback**

iOS Safari는 prompt API가 제한적이므로 “공유 → 홈 화면에 추가” 안내를 별도 표시한다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/lib/pwa.ts frontend/src/hooks/usePwaInstallPrompt.ts frontend/src/components/pwa/PwaInstallBanner.tsx frontend/src/components/layout frontend/public/manifest.json
git commit -m "feat(pwa): improve install prompt experience"
```

---

## Task 11: Push Permission / Subscription UX 개선

**Files:**
- Create: `frontend/src/lib/pushApi.ts`
- Create: `frontend/src/hooks/usePushPermission.ts`
- Create: `frontend/src/components/pwa/PushPermissionBanner.tsx`
- Create: `frontend/src/components/pwa/NotificationOptInCard.tsx`
- Modify: `frontend/src/components/layout/*` 또는 profile/post page
- Optional Modify: `backend/src/modules/push/*`
- Optional Modify: `backend/tests/push.test.ts`

- [x] **Step 1: VAPID public key 공급 방식 확인**

현재 프론트에서 VAPID public key를 받는 방식이 없다면 다음 중 하나를 선택한다.

권장:

```text
GET /api/push/vapid-public-key
```

대안:

```text
VITE_VAPID_PUBLIC_KEY
```

보안상 public key는 노출되어도 되지만 운영 편의상 backend endpoint가 권장된다.

- [x] **Step 2: permission 상태 hook 작성**

상태:
- unsupported
- default
- granted
- denied
- subscribed
- error

- [x] **Step 3: subscription 등록 구현**

흐름:
1. service worker ready 대기
2. Notification permission 요청
3. PushManager subscribe
4. `/api/push/subscribe` 호출

주의:
- 기존 정책은 user+이므로 미로그인 사용자는 로그인 유도
- 브라우저 권한 요청은 사용자 클릭 이벤트에서만 수행

- [x] **Step 4: UX 컴포넌트 구현**

- `PushPermissionBanner`: 새 글/답변 알림을 받을 수 있다는 안내
- `NotificationOptInCard`: profile 또는 post detail 하단에 삽입 가능
- denied 상태에서는 브라우저 설정에서 권한을 변경해야 한다고 안내

- [x] **Step 5: backend endpoint 추가 시 테스트**

`GET /api/push/vapid-public-key`를 추가한 경우:

```text
GET /api/push/vapid-public-key -> 200 { publicKey }
```

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

backend 변경 시:

```bash
cd backend
npm test -- tests/push.test.ts
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/lib/pushApi.ts frontend/src/hooks/usePushPermission.ts frontend/src/components/pwa frontend/src/components/layout backend/src/modules/push backend/tests/push.test.ts
git commit -m "feat(pwa): add push permission opt-in UX"
```

---

## Task 12: API Contract / README 문서 최종화

**Files:**
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-05-06-plan6-admin-advanced-operations-pwa-management.md`

- [ ] **Step 1: API contract 업데이트 확인**

반드시 포함:
- `GET /api/admin/dashboard`
- `GET /api/admin/comments`
- `PATCH /api/admin/comments/:id/hidden`
- layout admin usage
- schedule admin usage
- media type settings
- push send
- VAPID public key 공급 방식
- 공통 error code

- [ ] **Step 2: README 운영 가이드 추가**

필요 시 다음을 추가한다.

```text
관리자 고급 기능 접근 경로
홈 레이아웃 편집 주의사항
일정 관리 timezone 기준
미디어 타입 설정 주의사항
푸시 발송 주의사항
PWA 설치/푸시 알림 테스트 방법
```

- [ ] **Step 3: Plan 6 체크박스 상태 반영**

구현 완료된 Task/Step은 `[x]`로 업데이트한다.

- [ ] **Step 4: 확인**

```bash
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/api/2026-05-06-backend-api-contract.md README.md docs/superpowers/plans/2026-05-06-plan6-admin-advanced-operations-pwa-management.md
git commit -m "docs: finalize admin advanced operations plan"
```

---

## Task 13: 전체 회귀 검증

- [ ] **Step 1: clean 상태 확인**

```bash
git status --short
```

Expected: 의도한 변경만 존재

- [ ] **Step 2: backend build/test**

```bash
cd backend
npm run build
npm test
```

Expected: PASS

- [ ] **Step 3: frontend build/lint/test**

```bash
cd frontend
npm run build
npm run lint
npm test
```

Expected:
- build PASS
- lint/test 스크립트가 없으면 최종 보고에 명시

- [ ] **Step 4: Docker smoke test**

```bash
docker compose up --build -d
curl http://localhost/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 5: Admin route smoke test**

브라우저 또는 Playwright/Cypress가 있으면 확인:

```text
/admin
/admin/layout
/admin/schedule
/admin/settings
/admin/push
/admin/comments
```

Expected:
- 미로그인 redirect
- 일반 user 접근 차단
- admin 접근 가능

- [ ] **Step 6: PWA smoke test**

브라우저에서 확인:
- manifest 로드
- service worker 등록
- install banner 표시/닫기
- 로그인 user push opt-in 버튼 동작
- denied/unsupported 상태 안내

- [ ] **Step 7: 최종 Commit**

```bash
git add .
git commit -m "chore: complete admin advanced operations and pwa management"
```

---

## 완료 기준

- [ ] `/admin/layout`에서 홈 화면 섹션 노출/순서/게시물 배치를 편집할 수 있음
- [ ] `/admin/schedule`에서 월간 일정 조회/작성/수정/삭제가 가능함
- [ ] `/admin/settings`에서 미디어 타입 허용 여부와 최대 크기를 관리할 수 있음
- [ ] 관리자 푸시 composer에서 title/body/url을 입력하고 발송할 수 있음
- [ ] `GET /api/admin/dashboard` aggregate API가 구현되고 dashboard UI가 이를 사용함
- [ ] `GET /api/admin/comments` 전체 댓글 목록/필터링 API가 구현됨
- [ ] 댓글 숨김/숨김 해제와 관리자 답변 UX가 전체 댓글 화면에서 동작함
- [ ] PWA install banner가 지원 브라우저에서 동작하고 dismiss 정책을 지킴
- [ ] 로그인 사용자가 push permission opt-in을 진행할 수 있음
- [ ] Push permission denied/unsupported 상태가 사용자에게 명확히 안내됨
- [ ] API contract 문서가 Plan 6 변경사항을 반영함
- [ ] `cd backend && npm run build && npm test` PASS
- [ ] `cd frontend && npm run build` PASS
- [ ] Docker smoke test에서 `/api/health` 정상 응답

---

## Plan 7로 넘길 내용

Plan 6 완료 후 다음 계획은 `Plan 7: Portfolio Expansion + Personal Branding`로 진행한다.

Plan 7 후보 범위:
- 이력서/포트폴리오 자동 생성 페이지
- 작품 전시용 showcase layout 고도화
- 음악/오디오 플레이어 컴포넌트
- 갤러리 slideshow mode
- public profile editor 또는 admin profile settings
- SEO/Open Graph metadata 관리
- 다국어 지원(KO/EN) 기반 설계
