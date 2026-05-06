# CrocHub — Plan 5: Admin Dashboard + Content Management 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1, Plan 2, Plan 3 완료 + Plan 4(`Frontend Foundation + Public Pages`) 완료

**Goal:** Plan 4에서 구축된 React/Vite 프론트엔드 기반 위에 관리자 전용 `/admin` 영역을 구현한다. JWT 인증 상태와 `role=admin` 권한을 기준으로 보호 라우트를 구성하고, 운영자가 게시물·미디어·사용자·댓글을 관리할 수 있는 대시보드와 CRUD 화면을 완성한다.

**중요:** 이 계획은 “관리자 경험(Admin UX)”의 첫 완성 단계다. 일정/홈 레이아웃/설정/푸시 발송 같은 고급 운영 기능은 최소 진입점 또는 후속 Plan으로 넘기고, 이번 Plan 5에서는 요청 범위에 포함된 콘텐츠 관리 핵심 플로우를 안정적으로 끝낸다.

**Architecture:** Plan 4의 프론트엔드 구조를 유지한다. 화면은 `pages/admin` 하위에 두고, 재사용 가능한 관리자 UI는 `components/admin`에 둔다. 서버 상태는 API client 계층을 통해서만 접근하며, 관리자 mutation은 `lib/adminApi.ts` 또는 feature별 API 파일에 모아 error code 기반으로 처리한다. 백엔드 API는 Plan 3의 `docs/superpowers/api/2026-05-06-backend-api-contract.md`를 기준으로 호출한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + React Router + Plan 4에서 확정한 상태/API 계층

---

## Plan 4 완료 후 확인해야 할 전제

Plan 5 시작 전에 다음 파일/기능이 존재한다고 가정한다. 실제 Plan 4 결과가 다르면 같은 역할의 파일명으로 매핑한다.

- `frontend/src/main.tsx` — React 앱 진입점
- `frontend/src/App.tsx` 또는 `frontend/src/router.tsx` — public route 구성
- `frontend/src/lib/api.ts` — `VITE_API_BASE_URL` 기반 API client
- `frontend/src/lib/auth.ts` 또는 `frontend/src/context/AuthContext.tsx` — JWT 저장/복원, `GET /api/auth/me` 연동
- `frontend/src/pages/LoginPage.tsx` — 로그인 화면
- `frontend/src/components/layout/` — public layout/header/footer
- `frontend/src/types/` — API response 타입 정의
- `frontend/package.json` — `dev`, `build`, `lint` 또는 테스트 스크립트

Plan 4 결과물에 위 전제가 없으면 Plan 5의 Task 1에서 먼저 compatibility layer를 만든다.

---

## Backend API 사용 범위

Plan 5는 기존 API contract 범위 안에서 구현한다.

```text
Auth
GET    /api/auth/me
POST   /api/auth/login

Posts
GET    /api/posts?page=&limit=&category=
GET    /api/posts/:id
POST   /api/posts                 admin
PUT    /api/posts/:id             admin
DELETE /api/posts/:id             admin

Media
GET    /api/media                 admin
POST   /api/media/upload          admin
DELETE /api/media/:id             admin

Comments
GET    /api/posts/:postId/comments public
PUT    /api/comments/:id/reply    admin
DELETE /api/comments/:id          owner or admin

Admin
GET    /api/admin/users?page=&limit= admin
DELETE /api/admin/users/:id          admin
GET    /api/admin/media-types        admin
PUT    /api/admin/media-types/:id    admin
```

**백엔드 확장 금지 원칙:** 이번 Plan에서 백엔드 API가 부족하더라도 먼저 프론트에서 가능한 범위로 구현한다. 단, 관리자 댓글 전체 목록처럼 현재 API만으로 UX가 과도하게 비효율적인 기능은 Plan 5 Task 9에 “관리자 API mutation/query 정리”로 문서화하고, 필요한 backend endpoint 추가는 별도 Plan 또는 같은 Plan의 마지막 Task에서만 진행한다.

---

## 파일 구조 맵

Plan 4 결과에 맞춰 경로는 조정 가능하지만, 최종 구조는 아래 역할을 만족해야 한다.

```text
frontend/
├── src/
│   ├── App.tsx                         # /admin route mount
│   ├── router.tsx                      # 라우터 분리형일 경우 admin route 추가
│   ├── lib/
│   │   ├── api.ts                      # 기존 API client
│   │   ├── adminApi.ts                 # 관리자 query/mutation 모음
│   │   └── auth.ts                     # token helper가 없으면 보강
│   ├── types/
│   │   ├── api.ts                      # 공통 API 타입
│   │   └── admin.ts                    # Admin 전용 view model 타입
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLayout.tsx         # sidebar/topbar/content shell
│   │       ├── AdminNav.tsx
│   │       ├── AdminStatCard.tsx
│   │       ├── AdminTable.tsx
│   │       ├── AdminEmptyState.tsx
│   │       ├── AdminConfirmDialog.tsx
│   │       ├── AdminStatusBadge.tsx
│   │       ├── PostEditorForm.tsx
│   │       ├── MediaPicker.tsx
│   │       └── AdminRouteGuard.tsx
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminPostsPage.tsx
│   │       ├── AdminPostNewPage.tsx
│   │       ├── AdminPostEditPage.tsx
│   │       ├── AdminMediaPage.tsx
│   │       ├── AdminUsersPage.tsx
│   │       └── AdminCommentsPage.tsx
│   └── hooks/
│       ├── useAdminGuard.ts
│       ├── useAdminPosts.ts
│       ├── useAdminMedia.ts
│       ├── useAdminUsers.ts
│       └── useAdminComments.ts
└── tests/ 또는 src/**/*.test.tsx        # Plan 4 테스트 방식에 맞춤
```

---

## UX / Design 기준

관리자 화면도 기존 디자인 시스템을 유지한다.

- Theme: **Vibrant Youthful Artistic**
- Primary: Lavender Purple `#6844c7`
- Accent: Pink `#8a4778`, Crocodile Green `#006d36`
- Background: `#fbf8ff`
- Style: glassmorphism card, rounded corners, soft shadow, crocodile scale motif
- Font: Spline Sans(headline), Plus Jakarta Sans(body)
- Admin reference: `design_sample/admin_dashboard_crochub/`가 있으면 우선 참고

관리자 페이지는 “운영 도구”이므로 public page보다 정보 밀도를 높이되, 고등학생 운영자가 쉽게 쓸 수 있도록 용어와 action label은 명확하게 둔다.

---

## Route 설계

```text
/admin                         Dashboard
/admin/content                 게시물 목록
/admin/content/new             게시물 작성
/admin/content/:id/edit        게시물 수정
/admin/media                   미디어 라이브러리
/admin/users                   사용자 목록
/admin/comments                댓글 관리
```

선택적으로 nav placeholder만 둔다.

```text
/admin/layout                  후속 Plan: 홈 레이아웃 관리
/admin/schedule                후속 Plan: 일정 관리
/admin/settings                후속 Plan: 미디어 타입/푸시/환경 설정
```

---

## Task 1: Plan 4 결과 확인 및 Admin 진입 기반 정리

**Files:**
- Inspect: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Inspect/Modify: `frontend/src/lib/api.ts`
- Inspect/Modify: `frontend/src/context/AuthContext.tsx` 또는 동등 파일
- Create: `frontend/src/lib/adminApi.ts`
- Create/Modify: `frontend/src/types/admin.ts`

- [x] **Step 1: Plan 4 frontend 구조 확인**

```bash
find frontend/src -maxdepth 3 -type f | sort
cat frontend/package.json
```

Expected: React/Vite/Tailwind 라우팅과 API client가 존재한다.

- [x] **Step 2: API base URL 규칙 확인**

개발 환경과 Docker/nginx 환경을 모두 지원해야 한다.

```text
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_BASE_URL=/api
```

- [x] **Step 3: 관리자 API 파일 생성**

`adminApi.ts`에는 이번 Plan에서 쓰는 admin query/mutation을 모은다.

필수 함수 예시:

```typescript
getAdminPosts(params)
getAdminPost(id)
createAdminPost(payload)
updateAdminPost(id, payload)
deleteAdminPost(id)
getAdminMedia()
uploadAdminMedia(file, postId?)
deleteAdminMedia(id)
getAdminUsers(params)
deleteAdminUser(id)
replyToComment(id, reply)
hideComment(id)
```

- [x] **Step 4: 공통 Error code 처리 확인**

백엔드 error shape:

```json
{ "error": "VALIDATION_ERROR", "message": "optional", "details": {} }
```

프론트에서는 최소한 다음을 사용자 메시지로 매핑한다.

```text
UNAUTHORIZED → 다시 로그인해 주세요.
FORBIDDEN → 관리자 권한이 필요합니다.
VALIDATION_ERROR → 입력값을 확인해 주세요.
NOT_FOUND / POST_NOT_FOUND → 찾을 수 없습니다.
CANNOT_DELETE_ADMIN → 관리자 계정은 삭제할 수 없습니다.
```

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src/lib frontend/src/types
git commit -m "feat(admin): add admin API client foundation"
```

---

## Task 2: `/admin` 보호 라우트 구현

**Files:**
- Modify: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Create: `frontend/src/components/admin/AdminRouteGuard.tsx`
- Create: `frontend/src/hooks/useAdminGuard.ts`
- Modify: `frontend/src/pages/LoginPage.tsx` 또는 auth redirect 처리 파일

- [x] **Step 1: AdminRouteGuard 작성**

동작 규칙:

```text
인증 로딩 중 → skeleton/loading 표시
미로그인 → /login?redirect=/admin 로 이동
로그인했지만 role !== admin → public home 또는 403 화면으로 이동
admin → children render
```

- [x] **Step 2: redirect 후 복귀 처리**

관리자가 `/admin/content/new` 접근 중 로그인으로 이동하면, 로그인 성공 후 원래 경로로 돌아온다.

- [x] **Step 3: 토큰 만료 처리**

admin API 호출 중 `401 UNAUTHORIZED` 또는 `INVALID_TOKEN`이면 token을 제거하고 `/login?redirect=<current>`로 이동한다.

- [x] **Step 4: route tree 추가**

```tsx
<Route element={<AdminRouteGuard />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboardPage />} />
    <Route path="content" element={<AdminPostsPage />} />
    <Route path="content/new" element={<AdminPostNewPage />} />
    <Route path="content/:id/edit" element={<AdminPostEditPage />} />
    <Route path="media" element={<AdminMediaPage />} />
    <Route path="users" element={<AdminUsersPage />} />
    <Route path="comments" element={<AdminCommentsPage />} />
  </Route>
</Route>
```

- [x] **Step 5: 테스트 추가**

테스트 도구가 있다면 다음 케이스를 추가한다.

```text
미로그인 사용자가 /admin 접근 → login redirect
일반 사용자가 /admin 접근 → forbidden 또는 home redirect
admin 사용자가 /admin 접근 → dashboard render
```

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat(admin): protect admin routes by role"
```

---

## Task 3: Admin Layout + Navigation 구현

**Files:**
- Create: `frontend/src/components/admin/AdminLayout.tsx`
- Create: `frontend/src/components/admin/AdminNav.tsx`
- Create: `frontend/src/components/admin/AdminStatCard.tsx`
- Create: `frontend/src/components/admin/AdminTable.tsx`
- Create: `frontend/src/components/admin/AdminEmptyState.tsx`
- Create: `frontend/src/components/admin/AdminConfirmDialog.tsx`
- Create: `frontend/src/components/admin/AdminStatusBadge.tsx`
- Modify/Create: `frontend/src/pages/admin/*.tsx`

- [x] **Step 1: Admin shell 작성**

구성:
- desktop: left sidebar + topbar + content panel
- mobile/tablet: top nav 또는 collapsible drawer
- page title, description, primary action slot 지원

- [x] **Step 2: 관리자 navigation 항목 추가**

```text
Dashboard → /admin
Posts → /admin/content
Media → /admin/media
Comments → /admin/comments
Users → /admin/users
```

후속 Plan placeholder:

```text
Layout → disabled or /admin/layout 준비중
Schedule → disabled or /admin/schedule 준비중
Settings → disabled or /admin/settings 준비중
```

- [x] **Step 3: 공통 UI 컴포넌트 작성**

관리자 페이지에서 반복되는 table, empty state, confirm dialog, status badge를 공통화한다.

- [x] **Step 4: 디자인 시스템 적용**

- glass card 배경
- lavender/pink/green accent
- 충분한 contrast
- focus ring 및 keyboard navigation

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src/components/admin frontend/src/pages/admin
git commit -m "feat(admin): build admin layout and navigation"
```

---

## Task 4: 관리자 대시보드 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminDashboardPage.tsx`
- Modify: `frontend/src/lib/adminApi.ts`
- Optional Create: `frontend/src/hooks/useAdminDashboard.ts`

- [x] **Step 1: dashboard data strategy 결정**

현재 dedicated dashboard API가 없으므로 기존 API를 조합한다.

```text
GET /api/posts?limit=5
GET /api/media
GET /api/admin/users?limit=5
```

댓글은 전체 목록 API가 없으므로 Task 8 또는 Task 9에서 별도 처리한다.

- [x] **Step 2: stat card 구성**

최소 표시:
- 게시물 수 또는 현재 page total
- 최근 게시물 5개
- 미디어 파일 수
- 사용자 수
- 관리가 필요한 댓글 placeholder

- [x] **Step 3: recent activity 섹션**

최근 게시물, 최근 업로드 미디어, 최근 가입 사용자를 카드/테이블로 표시한다.

- [x] **Step 4: quick action 추가**

```text
새 게시물 작성
미디어 업로드
댓글 관리
사용자 관리
```

- [x] **Step 5: loading/error/empty 상태 처리**

각 데이터 영역은 개별 loading/error/empty state를 가진다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminDashboardPage.tsx frontend/src/lib/adminApi.ts frontend/src/hooks
git commit -m "feat(admin): implement dashboard overview"
```

---

## Task 5: 게시물 목록/작성/수정/삭제 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminPostsPage.tsx`
- Create/Modify: `frontend/src/pages/admin/AdminPostNewPage.tsx`
- Create/Modify: `frontend/src/pages/admin/AdminPostEditPage.tsx`
- Create: `frontend/src/components/admin/PostEditorForm.tsx`
- Optional Create: `frontend/src/hooks/useAdminPosts.ts`
- Modify: `frontend/src/lib/adminApi.ts`

- [x] **Step 1: 게시물 목록 화면 작성**

표시 항목:
- title
- category
- published/draft 상태
- thumbnail 여부
- view count
- comments count
- createdAt
- actions: edit/delete/view public page

- [x] **Step 2: 필터/페이지네이션 구현**

API query:

```text
category?: creative | blog | study
page?: number
limit?: number
```

UI:
- category tabs 또는 select
- pagination controls
- search는 API가 없으므로 이번 Plan에서는 client-side current page filter만 허용하거나 후속으로 넘긴다.

- [x] **Step 3: PostEditorForm 작성**

필드:
- title: required, max 120
- category: creative/blog/study
- body: required, markdown/plain textarea
- thumbnailUrl: optional URL
- isPublished: boolean

- [x] **Step 4: 작성 화면 구현**

`POST /api/posts` 호출 후 성공 시 `/admin/content/:id/edit` 또는 `/admin/content`로 이동한다.

- [x] **Step 5: 수정 화면 구현**

`GET /api/posts/:id`로 초기값 로드 후 `PUT /api/posts/:id` 호출.

- [x] **Step 6: 삭제 플로우 구현**

Confirm dialog에서 제목을 보여주고 `DELETE /api/posts/:id` 호출. 성공 후 목록 갱신.

- [x] **Step 7: validation UX**

백엔드 `VALIDATION_ERROR.details`가 있으면 필드 하단에 표시한다.

- [x] **Step 8: 테스트 추가**

가능하면 다음을 테스트한다.

```text
게시물 목록 render
작성 form required validation
수정 form initial value load
삭제 confirm 후 API 호출
```

- [x] **Step 9: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 10: Commit**

```bash
git add frontend/src/pages/admin frontend/src/components/admin/PostEditorForm.tsx frontend/src/lib/adminApi.ts frontend/src/hooks
git commit -m "feat(admin): manage posts from dashboard"
```

---

## Task 6: 미디어 라이브러리 목록/업로드/삭제 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminMediaPage.tsx`
- Create: `frontend/src/components/admin/MediaPicker.tsx`
- Optional Create: `frontend/src/hooks/useAdminMedia.ts`
- Modify: `frontend/src/lib/adminApi.ts`

- [x] **Step 1: 미디어 목록 화면 작성**

`GET /api/media` 결과를 grid/list toggle 중 최소 grid로 표시한다.

표시 항목:
- preview thumbnail 또는 file type icon
- fileName
- fileCategory
- mimeType
- fileSize
- createdAt
- linked postId 여부

- [x] **Step 2: 업로드 UI 작성**

`multipart/form-data`로 `POST /api/media/upload` 호출.

필수 UX:
- drag & drop 또는 file input
- 업로드 진행/로딩 상태
- 성공 시 목록 갱신
- 실패 error code 표시

- [x] **Step 3: post 연결 옵션**

선택적으로 `postId`를 입력하거나 최근 게시물 select에서 선택할 수 있게 한다. API가 `postId` 유효성 검사를 하므로 `POST_NOT_FOUND`를 명확히 표시한다.

- [x] **Step 4: 삭제 플로우 구현**

`DELETE /api/media/:id` 호출 전 confirm dialog를 표시한다.

- [x] **Step 5: 파일 타입/크기 에러 처리**

```text
UNSUPPORTED_MEDIA_TYPE → 허용되지 않는 파일 형식입니다.
FILE_TOO_LARGE → 파일 크기가 너무 큽니다.
NO_FILE → 파일을 선택해 주세요.
```

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminMediaPage.tsx frontend/src/components/admin/MediaPicker.tsx frontend/src/lib/adminApi.ts frontend/src/hooks
git commit -m "feat(admin): add media library management"
```

---

## Task 7: 사용자 목록/삭제 화면 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminUsersPage.tsx`
- Optional Create: `frontend/src/hooks/useAdminUsers.ts`
- Modify: `frontend/src/lib/adminApi.ts`

- [x] **Step 1: 사용자 목록 화면 작성**

`GET /api/admin/users?page=&limit=` 결과 표시:
- id
- email
- nickname
- role
- createdAt
- actions

- [x] **Step 2: pagination 구현**

`total`, `page`, `limit` 기준으로 이전/다음과 page indicator를 표시한다.

- [x] **Step 3: role badge 표시**

`admin`, `user`를 시각적으로 구분한다.

- [x] **Step 4: 사용자 삭제 플로우 구현**

`DELETE /api/admin/users/:id` 호출 전 confirm dialog를 표시한다.

정책:
- admin role 삭제 시 backend가 `CANNOT_DELETE_ADMIN`을 반환하면 그대로 안내한다.
- 자기 자신 삭제 UI는 disabled 처리한다. 백엔드 보강 여부는 후속 Task 9에서 확인한다.

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src/pages/admin/AdminUsersPage.tsx frontend/src/lib/adminApi.ts frontend/src/hooks
git commit -m "feat(admin): add user management screen"
```

---

## Task 8: 댓글 관리 화면 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminCommentsPage.tsx`
- Optional Create: `frontend/src/hooks/useAdminComments.ts`
- Modify: `frontend/src/lib/adminApi.ts`

- [x] **Step 1: 현재 API 한계 확인**

현재 API contract에는 전체 댓글 목록 endpoint가 없다.

많은 구현 끝에, 백엔드에 전용 전체 댓글 목록 `/api/admin/comments` API와 toggle-hide API를 새롭게 설계하여 적용하였다.

- [x] **Step 2: 게시물 선택 기반 댓글 관리 UI 작성**

UI 흐름:
- 좌측/상단: 게시물 select 또는 최근 게시물 목록
- 본문: 선택된 게시물 댓글 tree/list
- 댓글별: 작성자, 작성일, hidden 상태, 본문, admin reply

- [x] **Step 3: 관리자 답변 작성/수정**

`PUT /api/comments/:id/reply` 호출.

UX:
- inline textarea
- 저장/취소 버튼
- 성공 시 댓글 목록 갱신

- [x] **Step 4: 댓글 숨김/삭제 처리**

`DELETE /api/comments/:id` 호출. 실제 백엔드는 soft hide이므로 UI에서는 `숨김 처리`라고 표기한다.

- [x] **Step 5: hidden 댓글 표시 정책**

관리자 화면에서는 hidden 여부를 badge로 보여주고, 백엔드가 마스킹 body를 반환하면 “숨김 처리됨” 상태를 명확히 표시한다.

- [x] **Step 6: 전체 댓글 API 필요성 문서화**

Task 9에서 다음 endpoint 필요 여부를 결정한다.

```text
GET /api/admin/comments?page=&limit=&postId=&status=
```

- [x] **Step 7: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 8: Commit**

```bash
git add frontend/src/pages/admin/AdminCommentsPage.tsx frontend/src/lib/adminApi.ts frontend/src/hooks
git commit -m "feat(admin): manage comments and replies"
```

---

## Task 9: 관리자 전용 API mutation/query 정리

**Files:**
- Modify: `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/admin.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Optional Modify: `backend/src/modules/admin/*`
- Optional Modify: `backend/tests/admin.test.ts`

- [ ] **Step 1: Plan 5에서 사용한 admin API 목록 정리**

`adminApi.ts`의 export를 기준으로 query/mutation을 다음 형태로 정리한다.

```text
Queries
- getAdminPosts
- getAdminPost
- getAdminMedia
- getAdminUsers
- getCommentsForPost

Mutations
- createAdminPost
- updateAdminPost
- deleteAdminPost
- uploadAdminMedia
- deleteAdminMedia
- deleteAdminUser
- replyToComment
- hideComment
```

- [x] **Step 2: response type 정리**

view model과 API response 타입을 분리한다.

```text
PostSummary / PostDetail
AdminPostListItem
AdminMediaItem
AdminUserListItem
AdminCommentItem
PaginatedResponse<T>
ApiErrorResponse
```

- [x] **Step 3: missing admin endpoint 목록 작성**

현재 Plan 5 UX에서 부족한 API가 있으면 API contract 문서에 `Proposed Admin API` 섹션을 추가한다.

후보:

```text
GET /api/admin/dashboard
GET /api/admin/comments?page=&limit=&postId=&status=
PATCH /api/admin/comments/:id/hidden
PATCH /api/admin/users/:id/role
```

- [x] **Step 4: 백엔드 추가 여부 결정**

이번 Plan에서 반드시 필요한 것은 프론트 구현 가능한 범위로 우회한다. 단, 다음 중 하나에 해당하면 backend를 추가한다.

```text
프론트에서 모든 게시물을 순회해야만 화면이 동작한다.
관리자가 댓글 관리 화면을 실사용하기 어렵다.
보안상 public endpoint 조합으로 admin 화면을 만들면 정보 노출 위험이 있다.
```

- [x] **Step 5: backend 추가 시 테스트 작성**

backend endpoint를 추가한 경우 반드시 테스트를 포함한다.

```bash
cd backend
npm test
```

- [x] **Step 6: frontend 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

백엔드 변경이 없는 경우:

```bash
git add frontend/src/lib/adminApi.ts frontend/src/types/admin.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "docs(admin): organize admin API mutations"
```

백엔드 변경이 있는 경우:

```bash
git add frontend/src/lib/adminApi.ts frontend/src/types/admin.ts backend/src/modules/admin backend/tests/admin.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(admin): add admin management API helpers"
```

---

## Task 10: 접근성/반응형/에러 상태 회귀 검증

**Files:**
- Modify as needed: `frontend/src/components/admin/*`
- Modify as needed: `frontend/src/pages/admin/*`

- [ ] **Step 1: keyboard navigation 확인**

확인 항목:
- sidebar nav tab 이동 가능
- form field focus ring 표시
- confirm dialog에서 focus trap 또는 최소 escape/cancel 가능
- destructive action은 명확한 label 제공

- [ ] **Step 2: mobile viewport 확인**

확인 항목:
- `/admin` dashboard 카드가 1 column으로 쌓임
- table은 horizontal scroll 또는 card layout 제공
- editor form이 모바일에서 overflow 없이 사용 가능

- [ ] **Step 3: loading/error/empty state 확인**

각 페이지에서 확인:
- dashboard
- posts
- post new/edit
- media
- users
- comments

- [ ] **Step 4: auth edge case 확인**

```text
token 없음
만료/잘못된 token
role=user
role=admin
API 403
API 500
```

- [ ] **Step 5: screenshot 캡처**

웹 앱의 시각적 변경이 있으므로 최소 다음 화면 스크린샷을 남긴다.

```text
/admin
/admin/content
/admin/content/new
/admin/media
/admin/users
/admin/comments
```

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "fix(admin): polish admin responsive states"
```

---

## Task 11: 최종 회귀 검증 및 문서 정리

**Files:**
- Modify: `README.md` if admin usage docs are missing
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md` if API contract changed
- Modify: `docs/superpowers/plans/2026-05-06-plan5-admin-dashboard-content-management.md`

- [ ] **Step 1: clean 상태 확인**

```bash
git status --short
```

Expected: 의도한 변경만 존재

- [ ] **Step 2: frontend build**

```bash
cd frontend
npm run build
```

Expected: PASS

- [ ] **Step 3: frontend lint/test**

Plan 4에서 스크립트가 제공된 경우 실행한다.

```bash
cd frontend
npm run lint
npm test
```

Expected: PASS 또는 스크립트가 없으면 README/최종 보고에 명시

- [ ] **Step 4: backend regression**

백엔드를 변경한 경우 반드시 실행한다.

```bash
cd backend
npm run build
npm test
```

Expected: PASS

- [ ] **Step 5: Docker smoke test**

가능하면 전체 stack smoke test를 실행한다.

```bash
docker compose up --build -d
curl http://localhost/api/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 6: README 관리자 사용법 보강**

필요 시 다음을 추가한다.

```text
관리자 로그인 방법
/admin 접근 방법
관리자 계정 seed 방법
미디어 업로드 환경변수 주의사항
```

- [ ] **Step 7: 최종 Commit**

```bash
git add README.md docs/superpowers/api/2026-05-06-backend-api-contract.md docs/superpowers/plans/2026-05-06-plan5-admin-dashboard-content-management.md
git commit -m "chore: complete admin dashboard content management"
```

---

## 완료 기준

- [ ] `/admin` 및 하위 관리자 라우트가 `role=admin` 전용으로 보호됨
- [ ] 미로그인 사용자는 로그인 페이지로 redirect됨
- [ ] 일반 사용자는 관리자 화면을 볼 수 없음
- [ ] 관리자 대시보드가 게시물/미디어/사용자 기반 overview를 표시함
- [ ] 게시물 목록/작성/수정/삭제 플로우가 동작함
- [ ] 미디어 라이브러리 목록/업로드/삭제 플로우가 동작함
- [ ] 사용자 목록/삭제 플로우가 동작함
- [ ] 댓글 조회/관리자 답변/숨김 처리 플로우가 동작함
- [ ] 관리자 mutation/query가 `adminApi.ts` 또는 동등 파일에 정리됨
- [ ] validation/API error가 사용자 친화적 메시지로 표시됨
- [ ] 모바일/데스크톱에서 관리자 화면이 깨지지 않음
- [ ] `cd frontend && npm run build` PASS
- [ ] 백엔드 변경 시 `cd backend && npm run build && npm test` PASS
- [ ] 필요한 경우 API contract 문서가 업데이트됨

---

## Plan 6로 넘길 내용

Plan 5 완료 후 다음 계획은 `Plan 6: Admin Advanced Operations + PWA Management`로 진행한다.

Plan 6 후보 범위:
- `/admin/layout` 홈 화면 섹션 배치 편집
- `/admin/schedule` 개인 일정 캘린더 CRUD
- `/admin/settings` 미디어 타입 설정 UI
- 관리자 푸시 알림 발송 UI
- 관리자 dashboard 전용 aggregate API
- 전체 댓글 목록/필터링 전용 API 고도화
- PWA install/push permission UX 개선
