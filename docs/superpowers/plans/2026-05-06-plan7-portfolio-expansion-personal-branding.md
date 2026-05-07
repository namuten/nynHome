# CrocHub — Plan 7: Portfolio Expansion + Personal Branding 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~3 Backend Core/API Contract 완료 + Plan 4 Frontend Foundation/Public Pages 완료 + Plan 5 Admin Dashboard/Content Management 완료 + Plan 6 Admin Advanced Operations/PWA Management 완료

**Goal:** CrocHub를 단순 개인 홈페이지/CMS에서 “진학·자기소개·창작 아카이브용 개인 브랜딩 플랫폼”으로 확장한다. 운영자는 관리자 화면에서 프로필/브랜딩 정보, 작품 showcase, 음악/오디오, SEO/Open Graph, 다국어 콘텐츠를 관리하고, 방문자는 포트폴리오·프로필·작품 전시를 보기 좋은 형태로 열람할 수 있다.

**중요:** Plan 7은 public-facing 기능의 완성도를 크게 올리는 단계다. 관리자 편집 기능은 필요한 범위만 추가하고, 핵심은 “외부에 보여줄 수 있는 포트폴리오 경험”이다. 기존 posts/media/layout API를 최대한 활용하되, 이력서·프로필·SEO·다국어처럼 별도 데이터 모델이 필요한 기능은 backend migration/API를 additive 방식으로 추가한다.

**Architecture:**
- Frontend는 Plan 4 public layout과 Plan 5/6 admin shell을 재사용한다.
- Portfolio/Profile/Showcase public page는 SEO와 share preview를 고려해 data loading, meta tag, Open Graph fallback을 명확히 처리한다.
- Backend는 `profile`, `portfolio`, `showcase`, `i18n` 성격의 설정성 데이터를 Prisma 모델로 추가하거나 `site_settings`/`profile_settings` 계열 JSON config로 관리한다.
- 미디어 재생은 기존 media library를 우선 사용하고, 오디오 전용 메타데이터가 필요할 때만 확장한다.
- 다국어는 처음부터 완전한 번역 CMS를 만들기보다 KO/EN field 구조와 라우팅 정책을 먼저 확정한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + React Router + Express + Prisma + MySQL + Web Audio/HTMLMediaElement + SEO/Open Graph metadata helpers

---

## Plan 7 범위

이번 Plan의 확정 범위:

```text
Public Portfolio
- /portfolio                       진학/브랜딩용 포트폴리오 랜딩
- /portfolio/resume                이력서형 요약 페이지
- /portfolio/showcase              작품 전시 showcase
- /portfolio/showcase/:id          작품 상세

Public Profile / Branding
- /profile                         기존 프로필 페이지 고도화
- SEO/Open Graph metadata          주요 public page 공유 미리보기 개선

Admin
- /admin/profile                   public profile/branding 설정
- /admin/portfolio                 이력서/포트폴리오 섹션 관리
- /admin/showcase                  작품 showcase 큐레이션
- /admin/seo                       SEO/Open Graph 기본값 관리

Media Experience
- 오디오/음악 플레이어 컴포넌트
- 갤러리 slideshow mode

I18n Foundation
- KO/EN public copy 구조
- locale-aware route 또는 locale toggle 정책
```

이번 Plan에서 하지 않는 것:

```text
PDF 이력서 자동 렌더링/다운로드 완성
고급 WYSIWYG page builder
외부 SNS API 자동 동기화
결제/후원 기능
AI 자동 자기소개서 작성
전문 CMS 수준 번역 workflow
```

---

## 데이터 모델 확장 제안

Plan 7에서는 기존 posts/media를 재사용하되 다음 모델을 추가하는 것을 권장한다.

### profile_settings

```text
id                    INT PK
locale                VARCHAR(5)       # ko, en
display_name          VARCHAR(120)
tagline               VARCHAR(200)
bio                   TEXT
avatar_url            VARCHAR(500)
cover_image_url       VARCHAR(500)
school                VARCHAR(120) nullable
location              VARCHAR(120) nullable
email_public          VARCHAR(200) nullable
social_links          JSON             # instagram/youtube/github/etc
interests             JSON             # string[]
skills                JSON             # string[]
achievements          JSON             # structured list
updated_at            DATETIME
```

### portfolio_sections

```text
id                    INT PK
locale                VARCHAR(5)
section_key           VARCHAR(80)      # intro, education, activities, awards, skills, goals
 title                VARCHAR(160)
body                  TEXT
items                 JSON             # timeline/card/list data
order                 INT
is_visible            BOOLEAN
updated_at            DATETIME
```

### showcase_items

```text
id                    INT PK
title                 VARCHAR(160)
slug                  VARCHAR(180) UNIQUE
description           TEXT
category              ENUM('art','music','video','writing','study','project','other')
cover_media_id        INT FK nullable
media_ids             JSON             # media id array
post_id               INT FK nullable
locale                VARCHAR(5)
tags                  JSON
is_featured           BOOLEAN
is_published          BOOLEAN
published_at          DATETIME nullable
created_at            DATETIME
updated_at            DATETIME
```

### seo_settings

```text
id                    INT PK
route_key             VARCHAR(120) UNIQUE  # default, home, profile, portfolio, showcase
title                 VARCHAR(180)
description           VARCHAR(300)
og_image_url          VARCHAR(500)
keywords              JSON
locale                VARCHAR(5)
updated_at            DATETIME
```

**대안:** 초기 구현 속도를 우선하면 `site_settings` JSON table 하나로 시작할 수 있다. 단, showcase는 정렬/검색/공개 상태가 중요하므로 별도 모델을 권장한다.

---

## Backend API 확장 제안

```text
Profile
GET    /api/profile?locale=ko                         public
PUT    /api/admin/profile/:locale                     admin

Portfolio
GET    /api/portfolio?locale=ko                       public
PUT    /api/admin/portfolio/sections                  admin
POST   /api/admin/portfolio/sections                  admin
PUT    /api/admin/portfolio/sections/:id              admin
DELETE /api/admin/portfolio/sections/:id              admin

Showcase
GET    /api/showcase?category=&featured=&locale=ko    public
GET    /api/showcase/:slug                            public
POST   /api/admin/showcase                            admin
PUT    /api/admin/showcase/:id                        admin
DELETE /api/admin/showcase/:id                        admin
PUT    /api/admin/showcase/reorder                    admin

SEO
GET    /api/seo?routeKey=default&locale=ko            public
PUT    /api/admin/seo/:routeKey                       admin

I18n
GET    /api/i18n/public?locale=ko                     public optional
```

**주의:** `GET /api/profile`은 기존 `/profile` public page에서 사용한다. 기존 정적 프로필 구현이 있으면 API 기반으로 교체하거나 fallback 데이터를 유지한다.

---

## 파일 구조 맵

```text
frontend/
├── src/
│   ├── lib/
│   │   ├── portfolioApi.ts
│   │   ├── profileApi.ts
│   │   ├── seo.ts
│   │   └── i18n.ts
│   ├── types/
│   │   ├── portfolio.ts
│   │   ├── profile.ts
│   │   ├── showcase.ts
│   │   └── seo.ts
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── usePortfolio.ts
│   │   ├── useShowcase.ts
│   │   ├── useSeoMeta.ts
│   │   └── useLocale.ts
│   ├── components/
│   │   ├── portfolio/
│   │   │   ├── PortfolioHero.tsx
│   │   │   ├── ResumeTimeline.tsx
│   │   │   ├── SkillCloud.tsx
│   │   │   ├── AchievementCards.tsx
│   │   │   └── PortfolioSectionRenderer.tsx
│   │   ├── showcase/
│   │   │   ├── ShowcaseGrid.tsx
│   │   │   ├── ShowcaseCard.tsx
│   │   │   ├── ShowcaseDetail.tsx
│   │   │   ├── GallerySlideshow.tsx
│   │   │   └── AudioPlayer.tsx
│   │   └── admin/
│   │       ├── ProfileEditorForm.tsx
│   │       ├── PortfolioSectionEditor.tsx
│   │       ├── ShowcaseEditorForm.tsx
│   │       ├── SeoSettingsForm.tsx
│   │       └── LocaleTabs.tsx
│   └── pages/
│       ├── ProfilePage.tsx
│       ├── portfolio/
│       │   ├── PortfolioPage.tsx
│       │   ├── ResumePage.tsx
│       │   ├── ShowcasePage.tsx
│       │   └── ShowcaseDetailPage.tsx
│       └── admin/
│           ├── AdminProfilePage.tsx
│           ├── AdminPortfolioPage.tsx
│           ├── AdminShowcasePage.tsx
│           └── AdminSeoPage.tsx

backend/
├── prisma/
│   └── schema.prisma
├── src/
│   └── modules/
│       ├── profile/
│       │   ├── profile.router.ts
│       │   ├── profile.service.ts
│       │   └── profile.types.ts
│       ├── portfolio/
│       │   ├── portfolio.router.ts
│       │   ├── portfolio.service.ts
│       │   └── portfolio.types.ts
│       ├── showcase/
│       │   ├── showcase.router.ts
│       │   ├── showcase.service.ts
│       │   └── showcase.types.ts
│       └── seo/
│           ├── seo.router.ts
│           ├── seo.service.ts
│           └── seo.types.ts
└── tests/
    ├── profile.test.ts
    ├── portfolio.test.ts
    ├── showcase.test.ts
    └── seo.test.ts
```

---

## UX / Design 기준

- 기존 **Vibrant Youthful Artistic** 디자인 시스템을 유지한다.
- 포트폴리오 페이지는 “라벤더/핑크/크로코다일 그린”을 사용하되, 진학 자료로 공유해도 과하지 않게 정보 가독성을 우선한다.
- Showcase는 예술적이고 몰입감 있게, Resume는 깔끔하고 스캔하기 쉽게 분리한다.
- Audio/Gallery는 모바일 우선으로 조작이 쉬워야 한다.
- SEO/OG 이미지는 공유 시 미리보기 품질이 중요하므로 fallback 정책을 명확히 둔다.

---

## Route 설계

### Public

```text
/profile                         프로필/소개 고도화
/portfolio                       포트폴리오 랜딩
/portfolio/resume                이력서형 요약
/portfolio/showcase              작품 전시 목록
/portfolio/showcase/:slug        작품 상세
```

### Admin

```text
/admin/profile                   프로필/브랜딩 설정
/admin/portfolio                 포트폴리오 섹션 관리
/admin/showcase                  작품 showcase 관리
/admin/showcase/new              작품 showcase 작성
/admin/showcase/:id/edit         작품 showcase 수정
/admin/seo                       SEO/Open Graph 설정
```

### Locale 정책 후보

초기 권장: query/localStorage 기반 locale toggle

```text
/portfolio?lang=ko
/portfolio?lang=en
```

후속 확장 후보:

```text
/ko/portfolio
/en/portfolio
```

---

## Task 1: Plan 6 결과 확인 및 Portfolio 라우트 준비

**Files:**
- Inspect/Modify: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Inspect/Modify: `frontend/src/components/layout/*`
- Modify: `frontend/src/components/admin/AdminNav.tsx`
- Create: `frontend/src/lib/portfolioApi.ts`
- Create: `frontend/src/types/portfolio.ts`
- Create: `frontend/src/types/profile.ts`
- Create: `frontend/src/types/showcase.ts`

- [x] **Step 1: Plan 6 완료 상태 확인**

```bash
find frontend/src -maxdepth 4 -type f | sort
find backend/src/modules -maxdepth 2 -type f | sort
```

Expected:
- public layout 존재
- admin shell/nav 존재
- media library와 layout/schedule/settings 기능이 존재

- [x] **Step 2: public route placeholder 추가**

```text
/profile
/portfolio
/portfolio/resume
/portfolio/showcase
/portfolio/showcase/:slug
```

- [x] **Step 3: admin route placeholder 추가**

```text
/admin/profile
/admin/portfolio
/admin/showcase
/admin/showcase/new
/admin/showcase/:id/edit
/admin/seo
```

- [x] **Step 4: API 타입 baseline 작성**

최소 타입:

```text
ProfileSettings
PortfolioSection
ShowcaseItem
ShowcaseDetail
SeoSettings
LocaleCode = 'ko' | 'en'
```

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(portfolio): prepare portfolio and branding routes"
```

---

## Task 2: Profile/Branding 데이터 모델 및 API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/profile/profile.router.ts`
- Create: `backend/src/modules/profile/profile.service.ts`
- Create: `backend/src/modules/profile/profile.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/profile.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: Prisma model 추가**

`profile_settings` 모델을 추가한다. locale별 1 row를 권장한다.

- [x] **Step 2: public profile endpoint 구현**

```text
GET /api/profile?locale=ko
```

동작:
- locale 없으면 `ko`
- 해당 locale 데이터 없으면 default profile fallback 반환
- public endpoint

- [x] **Step 3: admin profile update endpoint 구현**

```text
PUT /api/admin/profile/:locale
```

Validation:
- displayName: 1~120
- tagline: optional max 200
- bio: optional max 10000
- avatarUrl/coverImageUrl: optional URL
- socialLinks: known keys만 허용하거나 string map으로 제한
- interests/skills: string array, 각 항목 max 60

- [x] **Step 4: seed 기본값 추가**

관리자 seed와 별개로 `ko`, `en` 기본 profile row를 생성한다.

- [x] **Step 5: 테스트 작성**

```text
GET /api/profile -> 200 default ko
GET /api/profile?locale=en -> 200
PUT /api/admin/profile/ko without token -> 401
PUT /api/admin/profile/ko as user -> 403
PUT /api/admin/profile/ko invalid url -> 400 VALIDATION_ERROR
PUT /api/admin/profile/ko as admin -> 200
```

- [x] **Step 6: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/profile.test.ts
npm run build
```

- [x] **Step 7: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/profile backend/src/app.ts backend/tests/profile.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(profile): add branding profile API"
```

---

## Task 3: Public Profile Page 고도화

**Files:**
- Modify: `frontend/src/pages/ProfilePage.tsx`
- Create: `frontend/src/lib/profileApi.ts`
- Create: `frontend/src/hooks/useProfile.ts`
- Create: `frontend/src/components/portfolio/SkillCloud.tsx`
- Create: `frontend/src/components/portfolio/AchievementCards.tsx`
- Modify: `frontend/src/types/profile.ts`

- [x] **Step 1: profile API client 작성**

```typescript
getProfile(locale: LocaleCode): Promise<ProfileSettings>
```

- [x] **Step 2: profile page 레이아웃 개선**

섹션:
- hero: avatar, displayName, tagline
- bio
- interests
- skills
- achievements
- social links
- portfolio CTA

- [x] **Step 3: fallback UX 구현**

profile API 실패 시 정적 fallback 또는 empty state를 제공한다.

- [x] **Step 4: 반응형 확인**

모바일에서 avatar/cover/social link가 깨지지 않아야 한다.

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src/pages/ProfilePage.tsx frontend/src/lib/profileApi.ts frontend/src/hooks/useProfile.ts frontend/src/components/portfolio frontend/src/types/profile.ts
git commit -m "feat(profile): enhance public branding page"
```

---

## Task 4: Admin Profile Editor 구현

**Files:**
- Create: `frontend/src/pages/admin/AdminProfilePage.tsx`
- Create: `frontend/src/components/admin/ProfileEditorForm.tsx`
- Create: `frontend/src/components/admin/LocaleTabs.tsx`
- Modify: `frontend/src/lib/profileApi.ts` 또는 `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/profile.ts`

- [x] **Step 1: locale tab UI 구현**

`ko`, `en` 탭으로 profile settings를 편집한다.

- [x] **Step 2: profile editor form 작성**

필드:
- displayName
- tagline
- bio
- avatarUrl
- coverImageUrl
- school/location
- public email
- social links
- interests
- skills
- achievements

- [x] **Step 3: list field editor 구현**

interests/skills/achievements는 add/remove/reorder가 가능해야 한다.

- [x] **Step 4: 저장 플로우 구현**

`PUT /api/admin/profile/:locale` 호출 후 public profile preview link 제공.

- [x] **Step 5: validation details 표시**

backend `VALIDATION_ERROR.details`를 field-level로 표시한다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminProfilePage.tsx frontend/src/components/admin/ProfileEditorForm.tsx frontend/src/components/admin/LocaleTabs.tsx frontend/src/lib frontend/src/types/profile.ts
git commit -m "feat(admin): add profile branding editor"
```

---

## Task 5: Portfolio Sections 데이터 모델 및 API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/portfolio/portfolio.router.ts`
- Create: `backend/src/modules/portfolio/portfolio.service.ts`
- Create: `backend/src/modules/portfolio/portfolio.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/portfolio.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: portfolio_sections model 추가**

locale, sectionKey, title, body, items JSON, order, isVisible을 포함한다.

- [x] **Step 2: public portfolio endpoint 구현**

```text
GET /api/portfolio?locale=ko
```

Response:

```json
{
  "locale": "ko",
  "sections": []
}
```

- [x] **Step 3: admin section CRUD 구현**

```text
POST   /api/admin/portfolio/sections
PUT    /api/admin/portfolio/sections/:id
DELETE /api/admin/portfolio/sections/:id
PUT    /api/admin/portfolio/sections/reorder
```

- [x] **Step 4: validation 규칙 정의**

- sectionKey: 1~80
- title: 1~160
- body: optional max 20000
- items: JSON array/object 허용하되 max size 제한
- order: non-negative integer
- isVisible: boolean
- locale: ko/en

- [x] **Step 5: 테스트 작성**

```text
GET /api/portfolio -> 200 sections
POST /api/admin/portfolio/sections as user -> 403
POST invalid locale -> 400
PUT section as admin -> 200
DELETE section as admin -> 204
```

- [x] **Step 6: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/portfolio.test.ts
npm run build
```

- [x] **Step 7: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/portfolio backend/src/app.ts backend/tests/portfolio.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(portfolio): add portfolio sections API"
```

---

## Task 6: Public Portfolio / Resume Pages 구현

**Files:**
- Create: `frontend/src/pages/portfolio/PortfolioPage.tsx`
- Create: `frontend/src/pages/portfolio/ResumePage.tsx`
- Create: `frontend/src/lib/portfolioApi.ts`
- Create: `frontend/src/hooks/usePortfolio.ts`
- Create: `frontend/src/components/portfolio/PortfolioHero.tsx`
- Create: `frontend/src/components/portfolio/ResumeTimeline.tsx`
- Create: `frontend/src/components/portfolio/PortfolioSectionRenderer.tsx`
- Modify: `frontend/src/types/portfolio.ts`

- [x] **Step 1: portfolio API client 작성**

```typescript
getPortfolio(locale: LocaleCode): Promise<PortfolioResponse>
```

- [x] **Step 2: Portfolio landing 구현**

섹션:
- intro hero
- featured achievements
- activities/projects
- skills/interests
- showcase CTA
- resume CTA

- [x] **Step 3: Resume page 구현**

이력서형 레이아웃:
- education
- activities
- awards
- skills
- goals
- contact/social

- [x] **Step 4: section renderer 구현**

sectionKey별 renderer를 두되 unknown section은 generic card로 렌더링한다.

- [x] **Step 5: print-friendly CSS 준비**

PDF 자동 생성은 하지 않지만 브라우저 print에서 읽기 좋도록 최소 스타일을 추가한다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/pages/portfolio frontend/src/lib/portfolioApi.ts frontend/src/hooks/usePortfolio.ts frontend/src/components/portfolio frontend/src/types/portfolio.ts
git commit -m "feat(portfolio): add public portfolio and resume pages"
```

---

## Task 7: Admin Portfolio Section Editor 구현

**Files:**
- Create: `frontend/src/pages/admin/AdminPortfolioPage.tsx`
- Create: `frontend/src/components/admin/PortfolioSectionEditor.tsx`
- Modify: `frontend/src/components/admin/LocaleTabs.tsx`
- Modify: `frontend/src/lib/portfolioApi.ts` 또는 `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/portfolio.ts`

- [x] **Step 1: section list UI 구현**

표시:
- locale
- sectionKey
- title
- visible
- order
- actions

- [x] **Step 2: section editor 구현**

필드:
- sectionKey
- title
- body
- items JSON 또는 structured list editor
- visible toggle

- [x] **Step 3: reorder 구현**

up/down 버튼 우선. drag-and-drop은 선택 기능이다.

- [x] **Step 4: preview pane 구현**

작성 중 public portfolio에서 어떻게 보일지 간단히 preview한다.

- [x] **Step 5: 저장/삭제 flow 구현**

create/update/delete/reorder API와 연결한다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminPortfolioPage.tsx frontend/src/components/admin/PortfolioSectionEditor.tsx frontend/src/components/admin/LocaleTabs.tsx frontend/src/lib frontend/src/types/portfolio.ts
git commit -m "feat(admin): add portfolio section editor"
```

---

## Task 8: Showcase 데이터 모델 및 API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/showcase/showcase.router.ts`
- Create: `backend/src/modules/showcase/showcase.service.ts`
- Create: `backend/src/modules/showcase/showcase.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/showcase.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: showcase_items model 추가**

필수 필드:
- title
- slug
- description
- category
- coverMediaId
- mediaIds JSON
- postId
- locale
- tags
- isFeatured
- isPublished
- publishedAt

- [x] **Step 2: public showcase list/detail 구현**

```text
GET /api/showcase?category=&featured=&locale=ko
GET /api/showcase/:slug
```

정책:
- public은 `isPublished=true`만 반환
- detail도 unpublished면 404

- [x] **Step 3: admin showcase CRUD 구현**

```text
POST   /api/admin/showcase
PUT    /api/admin/showcase/:id
DELETE /api/admin/showcase/:id
PUT    /api/admin/showcase/reorder
```

- [x] **Step 4: slug 정책 구현**

- title 기반 자동 slug 생성 가능
- slug 직접 수정 가능
- unique validation
- lowercase/kebab-case 권장

- [x] **Step 5: media id validation**

coverMediaId/mediaIds가 존재하는 media인지 확인한다.

- [x] **Step 6: 테스트 작성**

```text
GET /api/showcase returns published only
GET /api/showcase/:slug unpublished -> 404
POST /api/admin/showcase invalid mediaIds -> 400
POST duplicate slug -> 400 or 409
PUT as admin -> 200
DELETE as admin -> 204
```

- [x] **Step 7: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/showcase.test.ts
npm run build
```

- [x] **Step 8: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/showcase backend/src/app.ts backend/tests/showcase.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(showcase): add portfolio showcase API"
```

---

## Task 9: Public Showcase + Gallery Slideshow 구현

**Files:**
- Create: `frontend/src/pages/portfolio/ShowcasePage.tsx`
- Create: `frontend/src/pages/portfolio/ShowcaseDetailPage.tsx`
- Create: `frontend/src/lib/showcaseApi.ts`
- Create: `frontend/src/hooks/useShowcase.ts`
- Create: `frontend/src/components/showcase/ShowcaseGrid.tsx`
- Create: `frontend/src/components/showcase/ShowcaseCard.tsx`
- Create: `frontend/src/components/showcase/ShowcaseDetail.tsx`
- Create: `frontend/src/components/showcase/GallerySlideshow.tsx`
- Modify: `frontend/src/types/showcase.ts`

- [x] **Step 1: showcase API client 작성**

```typescript
getShowcaseList(params): Promise<ShowcaseItem[]>
getShowcaseDetail(slug): Promise<ShowcaseDetail>
```

- [x] **Step 2: showcase grid 구현**

기능:
- category filter
- featured badge
- responsive masonry 또는 simple grid
- empty state

- [x] **Step 3: showcase detail 구현**

구성:
- title/category/tags
- cover media
- description
- media gallery
- linked post CTA

- [x] **Step 4: GallerySlideshow 구현**

기능:
- previous/next
- keyboard arrow navigation
- escape close
- image/video/document fallback
- mobile swipe는 선택

- [x] **Step 5: 접근성 확인**

- slideshow button aria-label
- modal focus 처리
- 이미지 alt fallback

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/pages/portfolio frontend/src/lib/showcaseApi.ts frontend/src/hooks/useShowcase.ts frontend/src/components/showcase frontend/src/types/showcase.ts
git commit -m "feat(showcase): add public showcase gallery"
```

---

## Task 10: Admin Showcase Editor 구현

**Files:**
- Create: `frontend/src/pages/admin/AdminShowcasePage.tsx`
- Create: `frontend/src/pages/admin/AdminShowcaseNewPage.tsx`
- Create: `frontend/src/pages/admin/AdminShowcaseEditPage.tsx`
- Create: `frontend/src/components/admin/ShowcaseEditorForm.tsx`
- Modify: `frontend/src/components/admin/MediaPicker.tsx`
- Modify: `frontend/src/lib/showcaseApi.ts` 또는 `frontend/src/lib/adminApi.ts`
- Modify: `frontend/src/types/showcase.ts`

- [x] **Step 1: showcase admin list 구현**

표시:
- title
- slug
- category
- locale
- published/featured
- updatedAt
- actions

- [x] **Step 2: ShowcaseEditorForm 작성**

필드:
- title
- slug
- description
- category
- coverMediaId
- mediaIds
- linked postId
- tags
- locale
- isFeatured
- isPublished

- [x] **Step 3: media picker 연동**

Plan 5/6 media library picker를 재사용한다.

- [x] **Step 4: slug preview 구현**

public URL preview:

```text
/portfolio/showcase/:slug
```

- [x] **Step 5: publish flow 구현**

draft/published 상태를 명확히 보여주고 public page link는 published일 때 강조한다.

- [x] **Step 6: 삭제 flow 구현**

confirm dialog 사용.

- [x] **Step 7: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 8: Commit**

```bash
git add frontend/src/pages/admin/AdminShowcasePage.tsx frontend/src/pages/admin/AdminShowcaseNewPage.tsx frontend/src/pages/admin/AdminShowcaseEditPage.tsx frontend/src/components/admin/ShowcaseEditorForm.tsx frontend/src/components/admin/MediaPicker.tsx frontend/src/lib frontend/src/types/showcase.ts
git commit -m "feat(admin): add showcase editor"
```

---

## Task 11: 음악/오디오 플레이어 컴포넌트 구현

**Files:**
- Create: `frontend/src/components/showcase/AudioPlayer.tsx`
- Modify: `frontend/src/components/showcase/ShowcaseDetail.tsx`
- Modify: `frontend/src/types/showcase.ts`
- Optional Modify: `backend/src/modules/media/*`
- Optional Modify: `backend/tests/media.test.ts`

- [x] **Step 1: 오디오 media 식별 정책 확인**

기존 media `fileCategory=audio`를 사용한다.

- [x] **Step 2: AudioPlayer 구현**

기능:
- play/pause
- progress bar
- duration/current time
- volume 또는 mute
- keyboard accessible controls

- [x] **Step 3: playlist mode 선택 구현**

showcase detail에 audio media가 여러 개 있으면 playlist 형태로 표시한다.

- [x] **Step 4: fallback 처리**

브라우저에서 재생할 수 없는 MIME이면 다운로드 link 또는 “미리듣기 불가” 표시.

- [x] **Step 5: 모바일 UX 확인**

터치 target이 충분히 커야 한다.

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src/components/showcase/AudioPlayer.tsx frontend/src/components/showcase/ShowcaseDetail.tsx frontend/src/types/showcase.ts backend/src/modules/media backend/tests/media.test.ts
git commit -m "feat(showcase): add audio player experience"
```

---

## Task 12: SEO/Open Graph 설정 API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/seo/seo.router.ts`
- Create: `backend/src/modules/seo/seo.service.ts`
- Create: `backend/src/modules/seo/seo.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/seo.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: seo_settings model 추가**

routeKey별 title/description/ogImageUrl/keywords/locale를 저장한다.

- [x] **Step 2: public SEO endpoint 구현**

```text
GET /api/seo?routeKey=portfolio&locale=ko
```

fallback:
- routeKey 데이터 없음 → default
- locale 데이터 없음 → ko 또는 default

- [x] **Step 3: admin SEO update endpoint 구현**

```text
PUT /api/admin/seo/:routeKey
```

Validation:
- title: max 180
- description: max 300
- ogImageUrl: optional URL
- keywords: string array

- [x] **Step 4: 테스트 작성**

```text
GET /api/seo?routeKey=missing -> 200 default fallback
PUT /api/admin/seo/default as user -> 403
PUT /api/admin/seo/default invalid ogImageUrl -> 400
PUT /api/admin/seo/default as admin -> 200
```

- [x] **Step 5: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/seo.test.ts
npm run build
```

- [x] **Step 6: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/seo backend/src/app.ts backend/tests/seo.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(seo): add Open Graph settings API"
```

---

## Task 13: SEO/Open Graph Frontend 적용 및 Admin 설정 UI

**Files:**
- Create: `frontend/src/lib/seo.ts`
- Create: `frontend/src/hooks/useSeoMeta.ts`
- Create: `frontend/src/pages/admin/AdminSeoPage.tsx`
- Create: `frontend/src/components/admin/SeoSettingsForm.tsx`
- Modify: public route pages as needed
- Modify: `frontend/src/types/seo.ts`

- [x] **Step 1: meta helper 구현**

Vite SPA 환경에서 최소 `document.title`, `meta[name=description]`, `og:*` meta tag를 runtime에 업데이트한다.

- [x] **Step 2: public pages에 SEO 적용**

적용 대상:
- home
- profile
- portfolio
- resume
- showcase list
- showcase detail
- post detail

- [x] **Step 3: Admin SEO form 구현**

routeKey 선택:
- default
- home
- profile
- portfolio
- resume
- showcase
- post

필드:
- title
- description
- ogImageUrl
- keywords
- locale

- [x] **Step 4: fallback preview 구현**

카카오/Discord/X 스타일의 간단한 link preview card를 보여준다.

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src/lib/seo.ts frontend/src/hooks/useSeoMeta.ts frontend/src/pages/admin/AdminSeoPage.tsx frontend/src/components/admin/SeoSettingsForm.tsx frontend/src/types/seo.ts frontend/src/pages
git commit -m "feat(seo): manage public metadata settings"
```

---

## Task 14: 다국어(KO/EN) 기반 설계 및 Locale Toggle 구현

**Files:**
- Create: `frontend/src/lib/i18n.ts`
- Create: `frontend/src/hooks/useLocale.ts`
- Create: `frontend/src/components/LocaleToggle.tsx`
- Modify: public pages
- Modify: admin profile/portfolio/showcase/seo pages
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: locale 상태 정책 구현**

우선순위:
1. URL query `?lang=ko|en`
2. localStorage saved locale
3. browser language
4. default `ko`

- [ ] **Step 2: LocaleToggle 구현**

public header 또는 profile/portfolio 페이지 상단에 노출한다.

- [ ] **Step 3: API 요청 locale 연결**

profile/portfolio/showcase/seo API 호출에 locale을 전달한다.

- [ ] **Step 4: 관리자 locale 편집 UX 통일**

Profile/Portfolio/Showcase/SEO admin page에서 `LocaleTabs`를 재사용한다.

- [ ] **Step 5: 번역 누락 fallback 정책 구현**

영문 데이터가 없으면:
- admin 화면에서는 “영문 콘텐츠 없음” 표시
- public 화면에서는 ko fallback 또는 empty state 중 하나를 정책으로 확정한다.

권장: public은 ko fallback + locale badge.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/i18n.ts frontend/src/hooks/useLocale.ts frontend/src/components/LocaleToggle.tsx frontend/src/pages frontend/src/components/admin docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(i18n): add Korean English locale foundation"
```

---

## Task 15: 접근성/반응형/공유 품질 회귀 검증

**Files:**
- Modify as needed: `frontend/src/components/portfolio/*`
- Modify as needed: `frontend/src/components/showcase/*`
- Modify as needed: `frontend/src/pages/portfolio/*`
- Modify as needed: `frontend/src/pages/ProfilePage.tsx`

- [ ] **Step 1: portfolio responsive 확인**

확인 화면:

```text
/profile
/portfolio
/portfolio/resume
/portfolio/showcase
/portfolio/showcase/:slug
```

- [ ] **Step 2: admin responsive 확인**

확인 화면:

```text
/admin/profile
/admin/portfolio
/admin/showcase
/admin/seo
```

- [ ] **Step 3: keyboard accessibility 확인**

특히 확인:
- GallerySlideshow open/close/focus
- AudioPlayer controls
- LocaleToggle
- Admin list editor add/remove/reorder

- [ ] **Step 4: metadata 확인**

브라우저 devtools로 확인:
- title
- description
- og:title
- og:description
- og:image

- [ ] **Step 5: screenshot 캡처**

웹 앱 시각 변경이 크므로 최소 다음 스크린샷을 남긴다.

```text
/profile
/portfolio
/portfolio/resume
/portfolio/showcase
/portfolio/showcase/:slug
/admin/profile
/admin/portfolio
/admin/showcase
/admin/seo
```

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "fix(portfolio): polish responsive branding experience"
```

---

## Task 16: API Contract / README 문서 최종화

**Files:**
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-05-06-plan7-portfolio-expansion-personal-branding.md`

- [ ] **Step 1: API contract 업데이트 확인**

반드시 포함:
- profile public/admin endpoints
- portfolio sections endpoints
- showcase public/admin endpoints
- seo endpoints
- locale query 정책
- error code / validation 규칙

- [ ] **Step 2: README 사용법 추가**

필요 시 다음을 추가한다.

```text
포트폴리오 페이지 접근 경로
관리자 프로필/포트폴리오/showcase 편집 방법
오디오 파일 업로드/재생 지원 형식
SEO/Open Graph 설정 방법
KO/EN locale 사용 정책
```

- [ ] **Step 3: Plan 7 체크박스 상태 반영**

구현 완료된 Task/Step은 `[x]`로 업데이트한다.

- [ ] **Step 4: 확인**

```bash
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/api/2026-05-06-backend-api-contract.md README.md docs/superpowers/plans/2026-05-06-plan7-portfolio-expansion-personal-branding.md
git commit -m "docs: finalize portfolio expansion plan"
```

---

## Task 17: 전체 회귀 검증

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

- [ ] **Step 5: Public route smoke test**

```text
/profile
/portfolio
/portfolio/resume
/portfolio/showcase
/portfolio/showcase/:slug
```

Expected:
- 200 또는 SPA route 정상 렌더
- API loading/error fallback 정상
- mobile layout 깨짐 없음

- [ ] **Step 6: Admin route smoke test**

```text
/admin/profile
/admin/portfolio
/admin/showcase
/admin/seo
```

Expected:
- 미로그인 redirect
- 일반 user 접근 차단
- admin 접근 가능

- [ ] **Step 7: 최종 Commit**

```bash
git add .
git commit -m "chore: complete portfolio expansion and personal branding"
```

---

## 완료 기준

- [ ] `/profile`이 API 기반 public branding page로 고도화됨
- [ ] `/portfolio` 포트폴리오 랜딩 페이지가 구현됨
- [ ] `/portfolio/resume` 이력서형 요약 페이지가 구현됨
- [ ] `/portfolio/showcase` 작품 전시 목록이 구현됨
- [ ] `/portfolio/showcase/:slug` 작품 상세와 gallery slideshow가 구현됨
- [ ] 오디오/음악 미디어를 재생할 수 있는 AudioPlayer가 구현됨
- [ ] `/admin/profile`에서 프로필/브랜딩 정보를 편집할 수 있음
- [ ] `/admin/portfolio`에서 포트폴리오 섹션을 관리할 수 있음
- [ ] `/admin/showcase`에서 작품 showcase를 작성/수정/삭제할 수 있음
- [ ] `/admin/seo`에서 SEO/Open Graph 기본값을 관리할 수 있음
- [ ] KO/EN locale toggle과 locale-aware API 요청이 동작함
- [ ] API contract 문서가 Plan 7 변경사항을 반영함
- [ ] `cd backend && npm run build && npm test` PASS
- [ ] `cd frontend && npm run build` PASS
- [ ] Docker smoke test에서 `/api/health` 정상 응답

---

## Plan 8로 넘길 내용

Plan 7 완료 후 다음 계획은 `Plan 8: Production Hardening + Analytics + Deployment Polish`로 진행한다.

Plan 8 후보 범위:
- 운영 로그/감사 로그(admin mutation audit log)
- 방문자 analytics dashboard
- SEO sitemap/robots.txt 자동 생성
- 이미지 최적화/thumbnail pipeline
- media CDN cache 정책 정리
- backup/restore 운영 절차
- rate limiting / spam protection 고도화
- CI/CD production smoke test 강화
