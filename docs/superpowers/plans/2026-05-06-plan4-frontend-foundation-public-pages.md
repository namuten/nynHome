# CrocHub — Plan 4: Frontend Foundation + Public Pages 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 3 완료 — Backend build/test 안정화, `/api/schedules` API 계약 확정, API contract 문서 작성 완료

**Goal:** React(Vite) + TypeScript + Tailwind 기반 `frontend/` 앱을 만들고, 공개 사용자 페이지와 인증 화면의 1차 구현을 완료한다. Plan 5(Admin Dashboard)로 넘어가기 전에 라우팅, API client, auth 상태, 디자인 토큰, 기본 PWA 구조를 확정한다.

**Reference Docs:**
- `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- `docs/superpowers/specs/2026-05-06-crochub-personal-homepage-design.md`
- `design_sample/vibrant_youthful_artistic/DESIGN.md`
- `design_sample/home_my_creative_world/`
- `design_sample/croc_archive_media_library/`

**Scope:** 공개 페이지 + 인증 기반 + 프론트엔드 인프라만 구현한다. 관리자 대시보드, 게시물 작성, 미디어 업로드 UI, 레이아웃 에디터는 Plan 5/6에서 구현한다.

**Tech Stack:** React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query, Axios, React Hook Form, Zod, Lucide React, Vite PWA plugin

---

## 구현 원칙

- API 호출은 반드시 `docs/superpowers/api/2026-05-06-backend-api-contract.md` 기준으로 작성한다.
- `frontend/`는 새로 생성한다. 기존 backend 구조는 건드리지 않는다.
- 사용자 첫 화면은 실제 홈 피드여야 한다. 마케팅 랜딩 페이지를 만들지 않는다.
- 디자인은 `Vibrant Youthful Artistic` 토큰을 쓰되, 과한 장식보다 콘텐츠 탐색성과 모바일 사용성을 우선한다.
- 공개 페이지는 비로그인으로 접근 가능해야 한다.
- 댓글 작성, 푸시 구독 등 로그인 필요 기능은 로그인 상태에 따라 CTA를 분기한다.
- 관리자 라우트는 Plan 4에서 placeholder만 만든다. 실제 admin UI는 Plan 5에서 구현한다.

---

## 파일 구조 맵

```
nynHome/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   └── icons/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles/
│       │   └── globals.css
│       ├── lib/
│       │   ├── api.ts
│       │   ├── auth-storage.ts
│       │   ├── query-client.ts
│       │   └── format.ts
│       ├── types/
│       │   └── api.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── usePosts.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppShell.tsx
│       │   │   ├── SiteHeader.tsx
│       │   │   ├── MobileNav.tsx
│       │   │   └── PageContainer.tsx
│       │   ├── content/
│       │   │   ├── PostCard.tsx
│       │   │   ├── PostGrid.tsx
│       │   │   ├── CategoryTabs.tsx
│       │   │   └── EmptyState.tsx
│       │   ├── comments/
│       │   │   ├── CommentList.tsx
│       │   │   └── CommentForm.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       ├── Textarea.tsx
│       │       ├── Badge.tsx
│       │       ├── Spinner.tsx
│       │       └── ErrorPanel.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── GalleryPage.tsx
│       │   ├── BlogPage.tsx
│       │   ├── StudyPage.tsx
│       │   ├── PostDetailPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── AdminPlaceholderPage.tsx
│       │   └── NotFoundPage.tsx
│       └── routes/
│           └── router.tsx
├── docker-compose.yml
└── nginx/
    └── nginx.conf
```

---

## Task 1: Frontend 프로젝트 생성

**Files:**
- Create: `frontend/`

- [x] **Step 1: Vite React TypeScript 앱 생성**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

- [x] **Step 2: 기본 실행 확인**

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Expected:
- Vite dev server 정상 기동
- 브라우저에서 기본 React 화면 표시

- [x] **Step 3: 불필요한 starter 파일 정리**

Vite 기본 예제 로고/카운터 코드를 제거한다.

Expected:
- `App.tsx`는 router/provider 진입점 역할만 한다.
- public page 구현 전까지 임시 마케팅 문구를 만들지 않는다.

- [x] **Step 4: Commit**

```bash
git add frontend/
git commit -m "chore(frontend): scaffold React Vite app"
```

---

## Task 2: Tailwind CSS + 디자인 토큰 적용

**Files:**
- Create/Modify: `frontend/tailwind.config.ts`
- Create/Modify: `frontend/postcss.config.js`
- Create/Modify: `frontend/src/styles/globals.css`
- Modify: `frontend/src/main.tsx`

- [x] **Step 1: Tailwind 설치**

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [x] **Step 2: Tailwind content 경로 설정**

`frontend/tailwind.config.ts`

```typescript
content: ['./index.html', './src/**/*.{ts,tsx}']
```

- [x] **Step 3: 디자인 토큰 등록**

`design_sample/vibrant_youthful_artistic/DESIGN.md`의 색상/폰트/spacing을 Tailwind theme에 반영한다.

필수 색상:
- `background: #fbf8ff`
- `surface: #fbf8ff`
- `surface-container: #efedf5`
- `primary: #6844c7`
- `primary-container: #9d7bff`
- `secondary: #8a4778`
- `secondary-container: #fcaae2`
- `tertiary: #006d36`
- `on-surface: #1a1b21`
- `on-surface-variant: #494553`

폰트:
- headline/display: `Spline Sans`
- body: `Plus Jakarta Sans`

- [x] **Step 4: 글로벌 스타일 작성**

`globals.css`에 포함:
- Tailwind base/components/utilities
- Google Fonts import 또는 `index.html` font link
- body 기본 배경/폰트
- 접근성용 focus ring
- `.glass-surface`, `.croc-scale-bg` 같은 최소 유틸리티

주의:
- viewport 기반 font-size 스케일링 금지
- 과한 gradient orb/bokeh 장식 금지
- 카드는 반복 콘텐츠/툴/모달에만 사용

- [x] **Step 5: 확인**

```bash
cd frontend
npm run dev
```

Expected:
- Tailwind class가 정상 적용됨
- console error 없음

- [x] **Step 6: Commit**

```bash
git add frontend/
git commit -m "style(frontend): apply CrocHub design tokens"
```

---

## Task 3: 라우팅 + App Shell 구성

**Files:**
- Create: `frontend/src/routes/router.tsx`
- Create: `frontend/src/components/layout/*`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`
- Create: `frontend/src/pages/*.tsx`

- [x] **Step 1: 라우팅 의존성 설치**

```bash
cd frontend
npm install react-router-dom lucide-react
```

- [x] **Step 2: 라우트 구성**

필수 경로:

```text
/                  HomePage
/gallery           GalleryPage
/blog              BlogPage
/study             StudyPage
/post/:id          PostDetailPage
/profile           ProfilePage
/login             LoginPage
/register          RegisterPage
/admin             AdminPlaceholderPage
*                  NotFoundPage
```

- [x] **Step 3: AppShell 구현**

Desktop:
- 좌측 사이드 네비게이션 또는 상단 네비게이션 중 하나로 통일
- CrocHub brand 표시
- Home, Gallery, Blog, Study, Profile 링크
- 로그인 상태에 따라 Login/Register 또는 사용자 메뉴 표시

Mobile:
- 하단 탭 네비게이션
- Home, Gallery, Blog, Study, Profile
- 터치 영역 최소 44px 이상

- [x] **Step 4: 페이지 컨테이너 작성**

`PageContainer`는 max width, margin, vertical spacing만 담당한다.

주의:
- page section 자체를 floating card처럼 만들지 않는다.
- 카드 안에 카드를 중첩하지 않는다.

- [x] **Step 5: placeholder 페이지 작성**

각 페이지는 실제 레이아웃 자리만 잡고, 과한 설명 문구 없이 제목/빈 상태/로딩 상태만 둔다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run dev
```

Expected:
- 모든 route 이동 가능
- desktop/mobile 폭에서 navigation이 깨지지 않음

- [x] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): add routing and application shell"
```

---

## Task 4: API Client + 타입 정의

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/query-client.ts`
- Create: `frontend/src/types/api.ts`
- Modify: `frontend/src/main.tsx`

- [x] **Step 1: API 의존성 설치**

```bash
cd frontend
npm install axios @tanstack/react-query
```

- [x] **Step 2: 환경변수 정의**

Create: `frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

개발 환경 기본:
- Vite dev server: `http://localhost:3000/api`
- nginx/Docker 배포: `/api`

- [x] **Step 3: axios client 작성**

`api.ts` 요구사항:
- `baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'`
- request interceptor에서 token 자동 첨부
- response error는 API error format을 유지해서 throw
- raw `fetch` 혼용 금지

- [x] **Step 4: API TypeScript 타입 작성**

`docs/superpowers/api/2026-05-06-backend-api-contract.md` 기준으로 최소 타입 작성:

```text
User
AuthResponse
PostCategory
PostSummary
PostDetail
PaginatedResponse<T>
MediaItem
CommentItem
ScheduleItem
LayoutSection
ApiError
```

- [x] **Step 5: QueryClient 설정**

기본값:
- staleTime: 30초
- retry: 1회
- refetchOnWindowFocus: false

- [x] **Step 6: main.tsx에 provider 연결**

`QueryClientProvider`와 `RouterProvider`를 연결한다.

- [x] **Step 7: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 8: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): add API client and shared types"
```

---

## Task 5: Auth 상태 + 로그인/회원가입 화면

**Files:**
- Create: `frontend/src/lib/auth-storage.ts`
- Create: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/RegisterPage.tsx`
- Modify: `frontend/src/components/layout/SiteHeader.tsx`

- [x] **Step 1: form 의존성 설치**

```bash
cd frontend
npm install react-hook-form zod @hookform/resolvers
```

- [x] **Step 2: auth storage 작성**

저장 항목:
- `token`
- `user`

초기 구현은 `localStorage` 사용.

주의:
- token key는 상수로 관리한다. 예: `crochub.auth`
- JSON parse 실패 시 storage를 비운다.

- [x] **Step 3: useAuth 구현**

기능:
- `user`
- `token`
- `isAuthenticated`
- `isAdmin`
- `login(email, password)`
- `register(email, password, nickname)`
- `logout()`

- [x] **Step 4: LoginPage 구현**

UI:
- email/password form
- validation error 표시
- login 성공 시 이전 페이지 또는 `/` 이동
- register 링크

API:
- `POST /api/auth/login`

- [x] **Step 5: RegisterPage 구현**

UI:
- email/password/nickname form
- 가입 성공 시 자동 로그인하거나 login 페이지로 이동

API:
- `POST /api/auth/register`
- 자동 로그인 선택 시 이어서 `POST /api/auth/login`

- [x] **Step 6: Header/Nav 로그인 상태 반영**

비로그인:
- Login
- Register

로그인:
- nickname
- Logout
- admin이면 Admin 링크 표시

- [x] **Step 7: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 8: Commit**

```bash
git add frontend/src
git commit -m "feat(auth): add frontend auth flow"
```

---

## Task 6: 콘텐츠 목록 컴포넌트 + Category Pages

**Files:**
- Create: `frontend/src/hooks/usePosts.ts`
- Create/Modify: `frontend/src/components/content/*`
- Modify: `frontend/src/pages/GalleryPage.tsx`
- Modify: `frontend/src/pages/BlogPage.tsx`
- Modify: `frontend/src/pages/StudyPage.tsx`

- [x] **Step 1: posts query hook 작성**

`usePosts({ category, page, limit })`

API:

```text
GET /api/posts?category=&page=&limit=
```

- [x] **Step 2: PostCard 작성**

표시:
- thumbnail 또는 category별 fallback visual
- title
- category badge
- createdAt
- viewCount/views 필드 중 API contract와 실제 응답에 맞는 값
- comment count가 있으면 표시

주의:
- 긴 제목은 2줄 clamp
- 카드 높이 흔들림 최소화
- 이미지 영역 aspect-ratio 고정

- [x] **Step 3: PostGrid 작성**

상태:
- loading skeleton
- error panel
- empty state
- data grid

반응형:
- mobile 1열
- tablet 2열
- desktop 3열

- [x] **Step 4: Category pages 구현**

```text
/gallery -> category=creative
/blog    -> category=blog
/study   -> category=study
```

각 페이지는 같은 컴포넌트를 재사용하되 제목/설명/empty state만 다르게 한다.

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(content): add public category pages"
```

---

## Task 7: HomePage 구현

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`
- Optional Create: `frontend/src/hooks/useLayout.ts`
- Optional Create: `frontend/src/hooks/useSchedules.ts`

- [x] **Step 1: 홈 데이터 조회**

필수 API:
- `GET /api/posts?limit=6`

선택 API:
- `GET /api/layout`
- `GET /api/schedules?month=YYYY-MM`

- [x] **Step 2: 홈 첫 화면 구성**

첫 viewport에 포함:
- CrocHub brand/title
- 최신 콘텐츠 preview
- category quick actions
- 모바일에서도 다음 콘텐츠 일부가 보이게 구성

주의:
- 빈 마케팅 hero만 만들지 않는다.
- 실제 게시물 데이터가 첫 화면의 중심이어야 한다.

- [x] **Step 3: Featured/Latest 섹션 구현**

데이터가 있으면:
- latest posts grid
- featured section은 layout API가 있으면 postIds 기반, 없으면 latest fallback

데이터가 없으면:
- 업로드 전 빈 상태를 자연스럽게 표시

- [x] **Step 4: Schedule preview 선택 구현**

`GET /api/schedules`가 public이므로 홈 하단 또는 sidebar에 upcoming schedule 3개를 표시한다.

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(home): build public home experience"
```

---

## Task 8: Post Detail + Comments

**Files:**
- Modify: `frontend/src/pages/PostDetailPage.tsx`
- Create/Modify: `frontend/src/components/comments/*`
- Optional Create: `frontend/src/hooks/useComments.ts`

- [x] **Step 1: 게시물 상세 조회**

API:

```text
GET /api/posts/:id
```

상태:
- loading
- 404/not found
- error
- content

- [x] **Step 2: 본문 렌더링**

현재 body는 markdown 또는 HTML일 수 있다.

초기 정책:
- 기본은 plain text/line-break 렌더링
- HTML raw rendering은 XSS 위험 때문에 사용하지 않는다.
- Markdown rendering은 Plan 5 또는 별도 task에서 `react-markdown` + sanitizer로 확장한다.

- [x] **Step 3: 댓글 목록 조회**

API:

```text
GET /api/posts/:postId/comments
```

표시:
- 작성자 nickname
- createdAt
- body
- admin reply
- hidden comment mask

- [x] **Step 4: 댓글 작성**

로그인 상태:
- textarea + submit
- `POST /api/posts/:postId/comments`
- 성공 후 comments query invalidate

비로그인:
- Login 링크 CTA

- [x] **Step 5: 댓글 삭제는 Plan 4에서 선택**

Owner/Admin 삭제 UI는 복잡도가 있으므로 Plan 4에서는 선택 구현으로 둔다. 구현한다면:
- 본인 댓글 또는 admin만 Delete 버튼 표시
- `DELETE /api/comments/:id`

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat(posts): add post detail and comments"
```

---

## Task 9: ProfilePage 구현

**Files:**
- Modify: `frontend/src/pages/ProfilePage.tsx`

- [x] **Step 1: 정적 프로필 화면 구성**

초기 버전은 backend API 없이 정적 콘텐츠로 구성한다.

포함:
- CrocHub 소개
- 창작/블로그/학습 카테고리 소개
- 진학 포트폴리오로 확장 가능한 방향
- SNS/연락 링크 placeholder

- [x] **Step 2: 콘텐츠 연결**

각 카테고리 페이지로 이동하는 action을 배치한다.

- [x] **Step 3: 디자인**

프로필은 실제 개인 브랜딩 페이지처럼 보이게 구성하되, 과도한 자기소개 문구보다 콘텐츠 탐색 동선을 우선한다.

- [x] **Step 4: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 5: Commit**

```bash
git add frontend/src/pages/ProfilePage.tsx
git commit -m "feat(profile): implement ProfilePage"
```

---

## Task 10: PWA 기본 설정

**Files:**
- Modify: `frontend/vite.config.ts`
- Create: `frontend/public/manifest.webmanifest`
- Create: `frontend/public/icons/`

- [x] **Step 1: PWA plugin 설치**

```bash
cd frontend
npm install -D vite-plugin-pwa
```

- [x] **Step 2: manifest 작성**

필수:
- name: `CrocHub`
- short_name: `CrocHub`
- start_url: `/`
- display: `standalone`
- background_color: `#fbf8ff`
- theme_color: `#6844c7`
- icons: 192x192, 512x512

- [x] **Step 3: 아이콘 준비**

초기 아이콘은 `design_sample/purple_crocodile_logo/screen.png`를 참고해 사용 가능한 PNG로 배치한다.

주의:
- 저작/생성 경로가 불명확한 외부 이미지를 새로 가져오지 않는다.
- 필요하면 Plan 6에서 정식 앱 아이콘을 다시 만든다.

- [x] **Step 4: service worker 설정**

초기 정책:
- static assets cache
- API response cache는 하지 않는다.
- push notification 수신 처리는 Plan 7에서 구현한다.

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
npm run preview
```

Expected:
- manifest 로드
- service worker 등록 에러 없음

- [x] **Step 6: Commit**

```bash
git add frontend/
git commit -m "feat(pwa): add baseline PWA manifest"
```

---

## Task 11: Docker + Nginx Frontend 연결

**Files:**
- Create: `frontend/Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `nginx/nginx.conf`

- [x] **Step 1: frontend Dockerfile 작성**

멀티스테이지 빌드:
- build stage: node
- runtime stage: nginx 또는 정적 파일 산출

권장:
- frontend는 `npm run build`로 `dist`를 만들고, nginx가 정적 파일을 서빙한다.

- [x] **Step 2: docker-compose에 frontend service 추가**

옵션 A:
- `frontend` service가 build만 담당하고 nginx가 volume으로 dist를 서빙

옵션 B 권장:
- nginx 이미지에 frontend dist를 포함하는 별도 frontend runtime을 만든다.

현재 구조가 단순하므로 Plan 4에서는 다음을 우선한다.
- local dev는 Vite dev server 사용
- production docker는 nginx가 `/usr/share/nginx/html`에서 frontend dist를 서빙하도록 준비

- [x] **Step 3: nginx 설정 확인**

기존:

```nginx
location /api/ {
  proxy_pass http://api:3000;
}

location / {
  root /usr/share/nginx/html;
  try_files $uri $uri/ /index.html;
}
```

React Router fallback을 위해 `try_files`는 유지한다.

- [x] **Step 4: Docker build 확인**

```bash
docker compose up --build -d
curl http://localhost/api/health
curl http://localhost/
```

Expected:
- `/api/health` 200
- `/`에서 React 앱 HTML 응답

- [x] **Step 5: Commit**

```bash
git add frontend/Dockerfile docker-compose.yml nginx/nginx.conf
git commit -m "chore(frontend): wire frontend into Docker stack"
```

---

## Task 12: 프론트엔드 품질 검증

**Files:**
- Modify: `frontend/package.json`
- Optional Create: `frontend/src/**/*.test.tsx`

- [x] **Step 1: lint/build script 확인**

`package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

- [x] **Step 2: TypeScript build 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 3: 기본 UI smoke 확인**

브라우저에서 확인:
- `/`
- `/gallery`
- `/blog`
- `/study`
- `/post/:id`
- `/profile`
- `/login`
- `/register`

- [x] **Step 4: 모바일 폭 확인**

최소 확인 viewport:
- 390x844
- 768x1024
- 1440x900

확인 항목:
- 텍스트가 버튼/카드 밖으로 넘치지 않음
- 하단 navigation이 콘텐츠를 가리지 않음
- loading/error/empty 상태가 깨지지 않음

- [x] **Step 5: accessibility 기본 확인**

필수:
- 모든 button은 접근 가능한 label 보유
- form input은 label과 연결
- focus visible
- color contrast 기본 충족

- [x] **Step 6: Commit**

```bash
git add frontend/
git commit -m "test(frontend): verify public page build and smoke checks"
```

---

## Task 13: README 업데이트

**Files:**
- Modify: `README.md`
- Optional Create: `frontend/README.md`

- [x] **Step 1: 개발 실행 방법 추가**

포함:

```bash
# backend
docker compose up -d db
cd backend
npm run dev

# frontend
cd frontend
npm run dev
```

- [x] **Step 2: 환경변수 설명 추가**

Frontend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Backend:
- 기존 `.env.example` 참조

- [x] **Step 3: 주요 URL 추가**

```text
Frontend dev: http://localhost:5173
Backend API: http://localhost:3000/api
Nginx/Docker: http://localhost
```

- [x] **Step 4: Commit**

```bash
git add README.md frontend/README.md
git commit -m "docs: add frontend development instructions"
```

---

## 완료 기준

- [x] `frontend/` React + Vite + TypeScript 앱 생성
- [x] Tailwind CSS와 CrocHub 디자인 토큰 적용
- [x] React Router 기반 공개 라우트 구성
- [x] API client와 TypeScript API types 작성
- [x] 로그인/회원가입 화면 동작
- [x] Home/Gallery/Blog/Study/Post Detail/Profile 페이지 구현
- [x] 댓글 목록 조회 및 로그인 사용자 댓글 작성 가능
- [x] PWA manifest 기본 설정 완료
- [x] `cd frontend && npm run build` PASS
- [x] Docker/nginx 환경에서 React 앱과 `/api` proxy가 함께 동작
- [x] README에 frontend 실행 방법 작성

---

## Plan 5로 넘길 내용

Plan 4 완료 후 다음 계획은 `Plan 5: Admin Dashboard + Content Management`로 진행한다.

Plan 5 예정 범위:
- `/admin` 보호 라우트 구현
- 관리자 대시보드
- 게시물 목록/작성/수정/삭제
- 미디어 라이브러리 목록
- 사용자 목록
- 댓글 관리 화면
- 관리자 전용 API mutation 정리

