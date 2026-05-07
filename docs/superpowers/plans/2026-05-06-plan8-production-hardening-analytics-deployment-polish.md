# CrocHub — Plan 8: Production Hardening + Analytics + Deployment Polish 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~3 Backend Core/API Contract 완료 + Plan 4 Frontend Foundation/Public Pages 완료 + Plan 5 Admin Dashboard/Content Management 완료 + Plan 6 Admin Advanced Operations/PWA Management 완료 + Plan 7 Portfolio Expansion/Personal Branding 완료

**Goal:** CrocHub를 개발/기능 구현 중심 상태에서 실제 운영 가능한 production-grade 서비스로 강화한다. 관리자 mutation 감사 로그, 방문자 analytics, SEO sitemap/robots, 이미지 최적화, CDN/cache 정책, backup/restore 절차, rate limiting/spam protection, CI/CD production smoke test를 정리해 안정성·관측성·운영 편의성을 확보한다.

**중요:** Plan 8은 “기능 추가”보다 “운영 안정화”가 핵심이다. 사용자 경험을 깨지 않고 보안·성능·복구 가능성을 높이는 additive hardening으로 진행한다. 민감 정보(`.env`, API key, DB password, R2 secret)는 절대 커밋하지 않는다.

**Architecture:**
- Backend는 Express middleware 계층에 security/rate-limit/audit/analytics 수집 기능을 추가한다.
- Prisma/MySQL에는 audit log, analytics event/page view, backup metadata, thumbnail metadata 등 운영성 모델을 추가한다.
- Frontend는 analytics client와 admin analytics dashboard를 추가하되, 개인정보 최소 수집 원칙을 따른다.
- Infra는 Docker Compose, nginx, GitHub Actions 기준으로 production smoke test와 cache/security headers를 강화한다.
- Media optimization은 원본 보존 + 파생 thumbnail/web optimized asset 생성 전략을 사용한다.

**Tech Stack:** Node.js + Express + Prisma + MySQL + React/Vite + Docker Compose + nginx + GitHub Actions + Cloudflare R2/S3-compatible storage

---

## Plan 8 범위

이번 Plan의 확정 범위:

```text
Audit Log
- 관리자 mutation 감사 로그 저장
- admin dashboard에서 최근 운영 로그 조회

Analytics
- 방문자 page view/event 수집
- 관리자 analytics dashboard
- 개인정보 최소 수집 및 retention 정책

SEO Deployment Polish
- sitemap.xml 자동 생성
- robots.txt 생성/정리
- Open Graph fallback 검증

Media Optimization
- 이미지 thumbnail/webp 또는 avif 파생 asset 생성
- media metadata 보강
- CDN/cache header 정책 정리

Operations
- backup/restore 절차 문서화 및 script 추가
- DB backup smoke restore 검증
- rate limiting / spam protection
- CI/CD production smoke test 강화
```

이번 Plan에서 하지 않는 것:

```text
대규모 observability platform 도입(Sentry/Datadog full setup)
복잡한 A/B testing
사용자 행동 heatmap
유료 analytics SaaS 강제 연동
멀티 서버 orchestration(Kubernetes)
무중단 blue/green 배포 완성
```

---

## 운영 원칙

1. **개인정보 최소 수집**
   - IP 원문 저장 금지 권장. 필요하면 salt hash 또는 짧은 기간만 보관한다.
   - user agent는 coarse browser/device 정보로 축약하거나 retention을 둔다.
   - 로그인 user id는 필요한 event에만 nullable로 연결한다.

2. **복구 가능성 우선**
   - backup은 “생성”보다 “복원 검증”이 중요하다.
   - 최소 월 1회 restore rehearsal 문서를 남긴다.

3. **원본 보존 + 파생본 생성**
   - 업로드 원본 media는 유지한다.
   - thumbnail/web optimized 파일은 재생성 가능 asset으로 취급한다.

4. **보안 기본값 강화**
   - rate limit, security headers, body size limit, CORS origin 제한을 production 기준으로 정리한다.

5. **문서와 자동화 동시 제공**
   - 운영 절차는 README/docs에 적고, 반복 작업은 script로 제공한다.

---

## 데이터 모델 확장 제안

### audit_logs

```text
id                    INT PK
action                VARCHAR(120)      # post.create, media.delete, user.delete, settings.update
resource_type         VARCHAR(80)       # post, media, user, comment, settings, profile, etc
resource_id           VARCHAR(120) nullable
admin_user_id         INT FK nullable
summary               VARCHAR(300)
metadata              JSON nullable     # before/after diff 요약, request id 등
ip_hash               VARCHAR(128) nullable
user_agent_summary    VARCHAR(200) nullable
created_at            DATETIME
```

### analytics_events

```text
id                    BIGINT PK
event_name            VARCHAR(120)      # page_view, pwa_install_prompt, push_opt_in, showcase_view
route                 VARCHAR(300)
referrer              VARCHAR(500) nullable
locale                VARCHAR(5) nullable
user_id               INT FK nullable
session_id_hash       VARCHAR(128) nullable
metadata              JSON nullable
created_at            DATETIME
```

### daily_analytics_rollups

```text
id                    INT PK
day                   DATE
route                 VARCHAR(300) nullable
event_name            VARCHAR(120)
count                 INT
unique_sessions       INT
created_at            DATETIME
updated_at            DATETIME
```

### media_derivatives

```text
id                    INT PK
media_id              INT FK
derivative_type       VARCHAR(80)       # thumb_small, thumb_medium, web_optimized, og_image
file_url              VARCHAR(500)
width                 INT nullable
height                INT nullable
mime_type             VARCHAR(120)
file_size             BIGINT
created_at            DATETIME
```

### backup_runs

```text
id                    INT PK
backup_type           VARCHAR(80)       # db, media_manifest, full
status                VARCHAR(40)       # started, success, failed
file_url              VARCHAR(500) nullable
checksum              VARCHAR(128) nullable
size_bytes            BIGINT nullable
started_at            DATETIME
finished_at           DATETIME nullable
error_message         TEXT nullable
```

---

## Backend API 확장 제안

```text
Audit Logs
GET    /api/admin/audit-logs?page=&limit=&action=&resourceType=       admin

Analytics
POST   /api/analytics/events                                           public/user optional
GET    /api/admin/analytics/summary?from=&to=                          admin
GET    /api/admin/analytics/routes?from=&to=&limit=                    admin
GET    /api/admin/analytics/events?from=&to=&eventName=                admin

SEO
GET    /sitemap.xml                                                    public
GET    /robots.txt                                                     public
GET    /api/seo/sitemap-preview                                        admin

Media Optimization
POST   /api/admin/media/:id/derivatives/regenerate                     admin
GET    /api/admin/media/:id/derivatives                                admin

Backup / Operations
GET    /api/admin/backup-runs?page=&limit=                             admin
POST   /api/admin/backup-runs/db                                       admin optional/manual trigger
GET    /api/admin/system/health                                        admin
```

**주의:** backup trigger API는 운영 서버에서 shell 권한/DB dump 권한이 필요하므로 반드시 환경에 맞춰 제한한다. 초기에는 API 대신 script + 문서만 제공해도 된다.

---

## 파일 구조 맵

```text
backend/
├── prisma/
│   └── schema.prisma
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   ├── generate-sitemap.ts
│   └── smoke-prod.sh
├── src/
│   ├── middleware/
│   │   ├── audit.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── securityHeaders.middleware.ts
│   │   └── requestId.middleware.ts
│   ├── modules/
│   │   ├── audit/
│   │   │   ├── audit.router.ts
│   │   │   ├── audit.service.ts
│   │   │   └── audit.types.ts
│   │   ├── analytics/
│   │   │   ├── analytics.router.ts
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.types.ts
│   │   ├── seo/
│   │   │   └── sitemap.service.ts
│   │   ├── media/
│   │   │   └── media.derivatives.service.ts
│   │   └── operations/
│   │       ├── operations.router.ts
│   │       └── operations.service.ts
│   └── lib/
│       ├── ipHash.ts
│       ├── userAgentSummary.ts
│       └── cacheHeaders.ts
├── tests/
│   ├── audit.test.ts
│   ├── analytics.test.ts
│   ├── rate-limit.test.ts
│   ├── sitemap.test.ts
│   ├── media-derivatives.test.ts
│   └── operations.test.ts

frontend/
├── src/
│   ├── lib/
│   │   ├── analytics.ts
│   │   └── operationsApi.ts
│   ├── hooks/
│   │   ├── useAnalytics.ts
│   │   ├── useAdminAnalytics.ts
│   │   └── useAuditLogs.ts
│   ├── components/
│   │   ├── analytics/
│   │   │   ├── AnalyticsProvider.tsx
│   │   │   └── RouteTracker.tsx
│   │   └── admin/
│   │       ├── AnalyticsSummaryCards.tsx
│   │       ├── RouteAnalyticsTable.tsx
│   │       ├── AuditLogTable.tsx
│   │       └── BackupRunsTable.tsx
│   └── pages/
│       └── admin/
│           ├── AdminAnalyticsPage.tsx
│           ├── AdminAuditLogsPage.tsx
│           └── AdminOperationsPage.tsx

nginx/
└── nginx.conf

.github/
└── workflows/
    ├── ci.yml
    └── deploy.yml

docs/
└── operations/
    ├── backup-restore.md
    ├── incident-response.md
    └── production-checklist.md
```

---

## Route 설계

### Admin

```text
/admin/analytics                   방문자/route analytics dashboard
/admin/audit-logs                  관리자 mutation 감사 로그
/admin/operations                  backup runs, system health, 운영 체크리스트
```

### Public/System

```text
/sitemap.xml                       검색 엔진 sitemap
/robots.txt                        crawler 정책
/api/analytics/events              page view/event 수집
/api/health                        public health check
```

---

## Task 1: Plan 7 결과 확인 및 운영 라우트 준비

**Files:**
- Inspect/Modify: `frontend/src/components/admin/AdminNav.tsx`
- Inspect/Modify: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Create: `frontend/src/pages/admin/AdminAnalyticsPage.tsx`
- Create: `frontend/src/pages/admin/AdminAuditLogsPage.tsx`
- Create: `frontend/src/pages/admin/AdminOperationsPage.tsx`
- Create: `frontend/src/lib/operationsApi.ts`

- [x] **Step 1: Plan 7 완료 상태 확인**

```bash
find frontend/src -maxdepth 4 -type f | sort
find backend/src/modules -maxdepth 2 -type f | sort
```

Expected:
- portfolio/profile/showcase/seo 기능 존재
- admin shell/nav 존재
- API contract 최신 상태

- [x] **Step 2: admin nav에 운영 메뉴 추가**

```text
Analytics → /admin/analytics
Audit Logs → /admin/audit-logs
Operations → /admin/operations
```

- [x] **Step 3: route placeholder 추가**

보호 라우트는 Plan 5의 AdminRouteGuard를 그대로 사용한다.

- [x] **Step 4: operations API client baseline 작성**

```typescript
getAdminAnalyticsSummary(params)
getAdminRouteAnalytics(params)
getAuditLogs(params)
getBackupRuns(params)
getSystemHealth()
```

- [x] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(operations): prepare admin operations routes"
```

---

## Task 2: Request ID + Security Headers Middleware 추가

**Files:**
- Create: `backend/src/middleware/requestId.middleware.ts`
- Create: `backend/src/middleware/securityHeaders.middleware.ts`
- Modify: `backend/src/app.ts`
- Create/Modify: `backend/tests/security.test.ts`

- [x] **Step 1: request id middleware 작성**

- incoming `x-request-id`가 있으면 검증 후 사용
- 없으면 UUID 생성
- response header `x-request-id`로 반환
- request context 또는 `req.requestId`에 저장

- [x] **Step 2: security headers 적용**

기본 headers:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY 또는 SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP는 Vite/nginx/static asset 정책과 충돌 가능성이 있으므로 별도 검증 후 적용한다.

- [x] **Step 3: Express trust proxy 정책 확인**

nginx 뒤에서 IP 기반 rate limit을 할 경우 `app.set('trust proxy', 1)` 필요 여부를 운영 환경 기준으로 정한다.

- [x] **Step 4: 테스트 작성**

```text
GET /api/health returns x-request-id
GET /api/health returns security headers
```

- [x] **Step 5: 확인**

```bash
cd backend
npm test -- tests/security.test.ts
npm run build
```

- [x] **Step 6: Commit**

```bash
git add backend/src/middleware backend/src/app.ts backend/tests/security.test.ts
git commit -m "feat(security): add request id and security headers"
```

---

## Task 3: Rate Limiting + Spam Protection 기본값 적용

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/middleware/rateLimit.middleware.ts`
- Modify: `backend/src/app.ts`
- Modify: `backend/src/modules/comments/comments.router.ts`
- Modify: `backend/src/modules/auth/auth.router.ts`
- Modify: `backend/src/modules/analytics/analytics.router.ts` if exists
- Create: `backend/tests/rate-limit.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: rate limit strategy 확정**

권장 baseline:

```text
Auth login/register: 5 requests / 10 min / IP
Comments create: 10 requests / 10 min / user or IP
Analytics events: 60 requests / min / session or IP
Admin mutation: 120 requests / min / admin user
Global fallback: 300 requests / 5 min / IP
```

- [x] **Step 2: dependency 선택**

초기에는 `express-rate-limit` 사용을 권장한다.

```bash
cd backend
npm install express-rate-limit
```

- [x] **Step 3: 429 error format 표준화**

```json
{
  "error": "RATE_LIMITED",
  "message": "Too many requests. Please try again later."
}
```

- [x] **Step 4: comment spam guard 추가**

간단한 규칙:
- 빈/반복 문자 방지
- 동일 body 짧은 시간 반복 방지
- URL 과다 포함 방지

- [x] **Step 5: 테스트 작성**

```text
POST /api/auth/login over limit -> 429 RATE_LIMITED
POST /api/posts/:id/comments repeated spam -> 400 or 429
```

- [x] **Step 6: 확인**

```bash
cd backend
npm test -- tests/rate-limit.test.ts
npm run build
```

- [x] **Step 7: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/src/middleware backend/src/modules/comments backend/src/modules/auth backend/tests/rate-limit.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(security): add rate limiting and spam protection"
```

---

## Task 4: Audit Log 데이터 모델 및 서비스 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/audit/audit.router.ts`
- Create: `backend/src/modules/audit/audit.service.ts`
- Create: `backend/src/modules/audit/audit.types.ts`
- Create: `backend/src/middleware/audit.middleware.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/src/lib/ipHash.ts`
- Create: `backend/src/lib/userAgentSummary.ts`
- Create: `backend/tests/audit.test.ts`

- [x] **Step 1: Prisma model 추가**

`audit_logs` model을 추가한다.

- [x] **Step 2: audit service 작성**

```typescript
recordAuditLog({ action, resourceType, resourceId, adminUserId, summary, metadata, req })
```

- [x] **Step 3: IP hash helper 작성**

- 원문 IP 저장 금지 권장
- `AUDIT_IP_HASH_SALT` 환경변수 사용
- **salt 없으면 IP 저장 완전 비활성화 (확정)** — `AUDIT_IP_HASH_SALT`가 비어 있거나 없으면 `ip_hash` 필드에 `null`을 저장하고 서버 시작 시 경고 로그를 남긴다. 어떤 경우에도 원문 IP를 DB에 저장하지 않는다.

- [x] **Step 4: audit query API 구현**

```text
GET /api/admin/audit-logs?page=&limit=&action=&resourceType=
```

- [x] **Step 5: 테스트 작성**

```text
GET /api/admin/audit-logs without token -> 401
GET /api/admin/audit-logs as user -> 403
GET /api/admin/audit-logs as admin -> 200
recordAuditLog stores action/resource/admin id
```

- [x] **Step 6: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/audit.test.ts
npm run build
```

- [x] **Step 7: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/audit backend/src/middleware/audit.middleware.ts backend/src/lib/ipHash.ts backend/src/lib/userAgentSummary.ts backend/src/app.ts backend/tests/audit.test.ts
git commit -m "feat(audit): add admin mutation audit log service"
```

---

## Task 5: 관리자 Mutation에 Audit Log 연결

**Files:**
- Modify: `backend/src/modules/posts/*`
- Modify: `backend/src/modules/media/*`
- Modify: `backend/src/modules/comments/*`
- Modify: `backend/src/modules/admin/*`
- Modify: `backend/src/modules/layout/*`
- Modify: `backend/src/modules/schedule/*`
- Modify: `backend/src/modules/profile/*` if exists
- Modify: `backend/src/modules/portfolio/*` if exists
- Modify: `backend/src/modules/showcase/*` if exists
- Modify: `backend/src/modules/seo/*` if exists
- Modify: `backend/tests/audit.test.ts`

- [ ] **Step 1: audit 대상 action 목록 정의**

```text
post.create / post.update / post.delete
media.upload / media.delete / media.derivative.regenerate
comment.reply / comment.hide / comment.unhide
user.delete
layout.update
schedule.create / schedule.update / schedule.delete
settings.mediaType.update
profile.update
portfolio.section.create/update/delete/reorder
showcase.create/update/delete/reorder
seo.update
push.send
```

- [ ] **Step 2: service layer 또는 router layer 연결 결정**

권장:
- mutation 성공 후 router에서 명시적으로 `recordAuditLog` 호출
- 비즈니스 데이터 변경과 audit log를 같은 transaction에 묶을 수 있으면 service에서 처리

- [ ] **Step 3: metadata 최소화**

metadata에는 민감정보를 넣지 않는다.

허용 예:

```json
{
  "title": "게시물 제목",
  "changedFields": ["title", "isPublished"]
}
```

금지 예:

```text
password hash
JWT token
R2 secret
개인 이메일 대량 dump
```

- [ ] **Step 4: 테스트 보강**

대표 mutation 몇 개만 우선 검증한다.

```text
POST /api/posts creates audit log post.create
DELETE /api/media/:id creates audit log media.delete
PUT /api/admin/media-types/:id creates audit log settings.mediaType.update
POST /api/push/send creates audit log push.send
```

- [ ] **Step 5: 확인**

```bash
cd backend
npm test -- tests/audit.test.ts
npm test
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add backend/src backend/tests/audit.test.ts
git commit -m "feat(audit): record admin mutations"
```

---

## Task 6: Admin Audit Logs UI 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminAuditLogsPage.tsx`
- Create: `frontend/src/components/admin/AuditLogTable.tsx`
- Create: `frontend/src/hooks/useAuditLogs.ts`
- Modify: `frontend/src/lib/operationsApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: API client 작성**

```typescript
getAuditLogs({ page, limit, action, resourceType })
```

- [ ] **Step 2: table UI 구현**

컬럼:
- createdAt
- action
- resourceType/resourceId
- admin user
- summary
- request id

- [ ] **Step 3: filter UI 구현**

- action select/search
- resourceType select
- date range는 analytics와 같이 후속도 가능
- pagination

- [ ] **Step 4: metadata details disclosure**

각 row에서 metadata JSON 요약을 펼쳐 볼 수 있게 한다.

- [ ] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/admin/AdminAuditLogsPage.tsx frontend/src/components/admin/AuditLogTable.tsx frontend/src/hooks/useAuditLogs.ts frontend/src/lib/operationsApi.ts frontend/src/types/admin.ts
git commit -m "feat(admin): add audit log viewer"
```

---

## Task 7: Analytics 수집 API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/analytics/analytics.router.ts`
- Create: `backend/src/modules/analytics/analytics.service.ts`
- Create: `backend/src/modules/analytics/analytics.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/analytics.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: analytics models 추가**

`analytics_events`, `daily_analytics_rollups`를 추가한다.

- [ ] **Step 2: public event ingest endpoint 구현**

```text
POST /api/analytics/events
```

Request:

```json
{
  "eventName": "page_view",
  "route": "/portfolio",
  "referrer": "https://example.com",
  "locale": "ko",
  "sessionId": "client-generated-random-id",
  "metadata": {}
}
```

- [ ] **Step 3: validation 규칙**

- eventName: 1~120, allowlist 권장
- route: 내부 path만 허용
- referrer: optional URL
- locale: ko/en optional
- metadata: object, size 제한
- sessionId: raw 저장하지 않고 hash 저장

- [ ] **Step 4: admin summary endpoints 구현**

```text
GET /api/admin/analytics/summary?from=&to=
GET /api/admin/analytics/routes?from=&to=&limit=
GET /api/admin/analytics/events?from=&to=&eventName=
```

- [ ] **Step 5: retention 정책 문서화**

권장:
- raw analytics_events: 90일 보관
- daily rollups: 2년 보관

- [ ] **Step 6: rollup job 작성**

파일: `backend/src/jobs/analyticsRollup.job.ts`

동작:
- 전날(UTC 기준) raw `analytics_events`를 집계해 `daily_analytics_rollups`에 upsert
- `route + event_name` 기준으로 `count` / `unique_sessions` 집계
- 중복 실행 안전 (upsert, idempotent)
- 실행 방법: 서버 cron에서 `node dist/jobs/analyticsRollup.job.js` 매일 실행

`daily_analytics_rollups` 없이 admin summary endpoint만 구현하면 집계 데이터가 실제로 쌓이지 않는다.

- [ ] **Step 7: 테스트 작성**

```text
POST /api/analytics/events page_view -> 202 or 201
POST invalid route -> 400
GET /api/admin/analytics/summary as user -> 403
GET /api/admin/analytics/summary as admin -> 200
analyticsRollup.job produces correct rollup row for yesterday
```

- [ ] **Step 8: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/analytics.test.ts
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/analytics backend/src/jobs/analyticsRollup.job.ts backend/src/app.ts backend/tests/analytics.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(analytics): add privacy conscious event tracking and rollup job"
```

---

## Task 8: Frontend Analytics Client + Route Tracking 구현

**Files:**
- Create: `frontend/src/lib/analytics.ts`
- Create: `frontend/src/components/analytics/AnalyticsProvider.tsx`
- Create: `frontend/src/components/analytics/RouteTracker.tsx`
- Create: `frontend/src/hooks/useAnalytics.ts`
- Modify: `frontend/src/main.tsx` 또는 app shell
- Modify: public interaction components as needed

- [ ] **Step 1: session id 정책 구현**

- random UUID 생성
- localStorage 또는 sessionStorage 저장
- 서버에는 raw id를 보내도 서버에서 hash 처리하거나, 클라이언트에서 hash 전송 정책 선택

권장: 클라이언트 random id 전송 + 서버 hash 저장.

- [ ] **Step 2: page_view 자동 수집**

React Router location 변경 시 `page_view` event를 전송한다.

- [ ] **Step 3: 주요 interaction event 추가**

후보:

```text
pwa_install_prompt_shown
pwa_install_accepted
push_opt_in_started
push_opt_in_success
showcase_view
audio_play
portfolio_resume_view
```

- [ ] **Step 4: privacy opt-out 준비**

localStorage key 예시:

```text
crochub:analytics-opt-out=true
```

- [ ] **Step 5: 실패 무시 정책**

analytics 전송 실패는 사용자 flow를 막지 않는다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/analytics.ts frontend/src/components/analytics frontend/src/hooks/useAnalytics.ts frontend/src/main.tsx frontend/src
git commit -m "feat(analytics): track public route events"
```

---

## Task 9: Admin Analytics Dashboard 구현

**Files:**
- Create/Modify: `frontend/src/pages/admin/AdminAnalyticsPage.tsx`
- Create: `frontend/src/components/admin/AnalyticsSummaryCards.tsx`
- Create: `frontend/src/components/admin/RouteAnalyticsTable.tsx`
- Create: `frontend/src/hooks/useAdminAnalytics.ts`
- Modify: `frontend/src/lib/operationsApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: API client 작성**

```typescript
getAdminAnalyticsSummary({ from, to })
getAdminRouteAnalytics({ from, to, limit })
getAdminAnalyticsEvents({ from, to, eventName })
```

- [ ] **Step 2: summary cards 구현**

표시:
- page views
- unique sessions
- top route
- showcase views
- push opt-ins
- PWA install events

- [ ] **Step 3: date range filter 구현**

기본:
- 최근 7일
- 최근 30일
- 이번 달
- custom from/to

- [ ] **Step 4: route table 구현**

컬럼:
- route
- views
- unique sessions
- top locale
- trend placeholder

- [ ] **Step 5: empty state**

데이터가 없으면 analytics 설치/수집 상태 안내를 보여준다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminAnalyticsPage.tsx frontend/src/components/admin/AnalyticsSummaryCards.tsx frontend/src/components/admin/RouteAnalyticsTable.tsx frontend/src/hooks/useAdminAnalytics.ts frontend/src/lib/operationsApi.ts frontend/src/types/admin.ts
git commit -m "feat(admin): add analytics dashboard"
```

---

## Task 10: Sitemap.xml + Robots.txt 자동 생성

**Files:**
- Create/Modify: `backend/src/modules/seo/sitemap.service.ts`
- Modify: `backend/src/modules/seo/seo.router.ts` or `backend/src/app.ts`
- Create: `backend/scripts/generate-sitemap.ts`
- Create: `backend/tests/sitemap.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Optional Modify: `nginx/nginx.conf`

- [ ] **Step 1: sitemap source 정의**

포함 대상:
- `/`
- `/profile`
- `/portfolio`
- `/portfolio/resume`
- `/portfolio/showcase`
- published posts
- published showcase items
- category pages: `/gallery`, `/blog`, `/study`

- [ ] **Step 2: public sitemap endpoint 구현**

```text
GET /sitemap.xml
```

Response:
- `Content-Type: application/xml`
- XML escape 처리
- absolute URL 사용

환경변수:

```text
PUBLIC_SITE_URL=https://example.com
```

- [ ] **Step 3: robots endpoint 구현**

```text
GET /robots.txt
```

기본:

```text
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

- [ ] **Step 4: admin preview optional 구현**

```text
GET /api/seo/sitemap-preview admin
```

- [ ] **Step 5: 테스트 작성**

```text
GET /sitemap.xml -> 200 application/xml
GET /robots.txt -> 200 text/plain
sitemap includes published post and excludes draft
```

- [ ] **Step 6: 확인**

```bash
cd backend
npm test -- tests/sitemap.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/seo backend/scripts/generate-sitemap.ts backend/tests/sitemap.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md nginx/nginx.conf
git commit -m "feat(seo): generate sitemap and robots endpoints"
```

---

## Task 11: 이미지 최적화/Thumbnail Pipeline 구현

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/media/media.derivatives.service.ts`
- Modify: `backend/src/modules/media/media.router.ts`
- Modify: `backend/src/modules/media/media.service.ts`
- Create: `backend/tests/media-derivatives.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: 이미지 처리 라이브러리 선택**

권장: `sharp`

```bash
cd backend
npm install sharp
```

**Alpine Docker에서 sharp 빌드 실패 시 (흔한 문제):**

방법 A — Dockerfile에 native dependency 추가:

```dockerfile
RUN apk add --no-cache vips-dev fftw-dev gcc g++ make
```

방법 B — musl 전용 prebuilt 바이너리 사용:

```bash
npm install --cpu=x64 --os=linuxmusl sharp
```

방법 C — sharp 대신 `jimp` (순수 JS, native 없음, 처리 속도 느림) 로 대체.

**이 Step이 블로킹되면 Task 11을 선택 구현으로 격하하고 다음 Task를 먼저 진행한다.**

- [ ] **Step 2: media_derivatives model 추가**

`media_id`, derivative_type, file_url, width/height, mimeType, fileSize 저장.

- [ ] **Step 3: derivative generation 정책 정의**

이미지 업로드 시 생성:

```text
thumb_small: 320px webp
thumb_medium: 768px webp
web_optimized: max 1600px webp
og_image: 1200x630 crop/fit optional
```

- [ ] **Step 4: R2 업로드 연동**

파생 파일 key 예시:

```text
derivatives/{mediaId}/thumb_medium.webp
```

- [ ] **Step 5: regenerate endpoint 구현**

```text
POST /api/admin/media/:id/derivatives/regenerate
GET  /api/admin/media/:id/derivatives
```

- [ ] **Step 6: 실패 정책**

원본 업로드 성공 후 derivative 실패는 업로드 전체를 실패시킬지 결정한다.

권장:
- 원본 업로드는 성공 처리
- derivative 실패는 warning log + admin에서 regenerate 가능

- [ ] **Step 7: 테스트 작성**

```text
image upload creates derivatives when image type
non-image upload skips derivatives
regenerate as user -> 403
regenerate as admin -> 200
```

- [ ] **Step 8: 확인**

```bash
cd backend
npm test -- tests/media-derivatives.test.ts
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/prisma/schema.prisma backend/src/modules/media backend/tests/media-derivatives.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(media): add image derivative pipeline"
```

---

## Task 12: Frontend Image/Media 최적화 적용

**Files:**
- Modify: `frontend/src/components/*` as needed
- Modify: `frontend/src/components/showcase/*`
- Modify: `frontend/src/pages/*` as needed
- Modify: `frontend/src/types/media.ts` or equivalent
- Modify: `frontend/src/lib/adminApi.ts` or media API client

- [ ] **Step 1: media type에 derivatives 추가**

Frontend 타입에서 `derivatives` 배열 또는 key map을 지원한다.

- [ ] **Step 2: image source 선택 helper 작성**

우선순위:

```text
thumbnail component → thumb_medium → web_optimized → original
OG/share image → og_image → web_optimized → original
full gallery → web_optimized → original
```

- [ ] **Step 3: lazy loading 적용**

public gallery/showcase/post thumbnail에 `loading="lazy"` 적용.

- [ ] **Step 4: width/height 지정**

CLS 방지를 위해 가능한 이미지에 width/height 또는 aspect-ratio를 지정한다.

- [ ] **Step 5: admin media 화면 derivative 상태 표시**

- derivative exists/missing badge
- regenerate action link

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat(media): use optimized image derivatives"
```

---

## Task 13: CDN/Cache Header 정책 정리

**Files:**
- Modify: `nginx/nginx.conf`
- Create: `backend/src/lib/cacheHeaders.ts`
- Modify: `backend/src/app.ts` or static/media routes
- Modify: `docker-compose.yml` if needed
- Create/Modify: `docs/operations/production-checklist.md`

- [ ] **Step 1: static asset cache 정책 정의**

권장:

```text
Vite hashed assets: Cache-Control: public, max-age=31536000, immutable
HTML shell: Cache-Control: no-cache
API JSON: no-store 또는 private, no-cache
sitemap/robots: public, max-age=3600
media original: public, max-age=86400
media derivatives: public, max-age=31536000, immutable if key content-addressed
```

- [ ] **Step 2: nginx headers 적용**

정적 asset location에 cache header 추가.

- [ ] **Step 3: API cache 방지**

민감한 admin API에 `Cache-Control: no-store`를 적용한다.

- [ ] **Step 4: R2/CDN cache 정책 문서화**

Cloudflare R2 public URL/CDN 앞단에서 어떤 cache TTL을 기대하는지 문서화한다.

- [ ] **Step 5: 확인**

```bash
docker compose up --build -d
curl -I http://localhost/
curl -I http://localhost/api/health
curl -I http://localhost/sitemap.xml
```

- [ ] **Step 6: Commit**

```bash
git add nginx/nginx.conf backend/src/lib/cacheHeaders.ts backend/src/app.ts docker-compose.yml docs/operations/production-checklist.md
git commit -m "chore(cache): define production cache headers"
```

---

## Task 14: Backup/Restore Script 및 운영 문서 작성

**Files:**
- Create: `backend/scripts/backup-db.sh`
- Create: `backend/scripts/restore-db.sh`
- Create: `docs/operations/backup-restore.md`
- Create: `docs/operations/incident-response.md`
- Create/Modify: `docs/operations/production-checklist.md`
- Optional Modify: `docker-compose.yml`

- [ ] **Step 1: backup script 작성**

기능:
- `mysqldump` 실행
- gzip 압축
- checksum 생성
- output path 명시
- production env 직접 로깅 금지

예시 command:

```bash
./backend/scripts/backup-db.sh ./backups
```

- [ ] **Step 2: restore script 작성**

기능:
- gzip dump 복원
- 대상 DB 확인 prompt 또는 `--yes` flag
- production에 실수 복원 방지 guard

예시 command:

```bash
./backend/scripts/restore-db.sh ./backups/crochub.sql.gz --target crochub_restore
```

- [ ] **Step 3: media backup policy 문서화**

R2 bucket은 DB dump와 별개로:
- lifecycle/versioning 정책
- media manifest export
- 삭제 보호 정책
을 문서화한다.

- [ ] **Step 4: restore rehearsal 문서 작성**

최소 절차:
1. 새 DB 생성
2. dump restore
3. Prisma migrate status 확인
4. API health check
5. 주요 public/admin route smoke test

- [ ] **Step 5: incident response 문서 작성**

포함:
- 장애 분류
- rollback 절차
- DB restore 판단 기준
- secret leak 대응
- R2 media 삭제 사고 대응

- [ ] **Step 6: shellcheck 또는 dry-run 확인**

가능하면 실행:

```bash
bash -n backend/scripts/backup-db.sh
bash -n backend/scripts/restore-db.sh
```

- [ ] **Step 7: Commit**

```bash
git add backend/scripts/backup-db.sh backend/scripts/restore-db.sh docs/operations
git commit -m "docs(ops): add backup restore runbooks"
```

---

## Task 15: Backup Runs API/Admin Operations UI 선택 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/operations/operations.router.ts`
- Create: `backend/src/modules/operations/operations.service.ts`
- Create: `backend/tests/operations.test.ts`
- Modify: `frontend/src/pages/admin/AdminOperationsPage.tsx`
- Create: `frontend/src/components/admin/BackupRunsTable.tsx`
- Modify: `frontend/src/lib/operationsApi.ts`

- [ ] **Step 1: API 구현 여부 결정**

초기 운영에서는 script + 문서만으로 충분할 수 있다. UI에서 backup run history를 보여주려면 `backup_runs` model/API를 추가한다.

- [ ] **Step 2: backup_runs model 추가**

Task 14 script가 backup 결과를 DB에 기록하도록 연동할지 결정한다.

- [ ] **Step 3: backup runs endpoint 구현**

```text
GET /api/admin/backup-runs?page=&limit=
```

Optional manual trigger:

```text
POST /api/admin/backup-runs/db
```

수동 trigger는 운영 서버 권한/보안 리스크가 있으므로 기본 비활성화 권장.

- [ ] **Step 4: system health endpoint 구현**

```text
GET /api/admin/system/health
```

Response 후보:

```json
{
  "database": "ok",
  "storage": "ok",
  "uptimeSeconds": 123,
  "version": "git-sha"
}
```

- [ ] **Step 5: AdminOperationsPage 구현**

표시:
- system health card
- backup run list
- runbook links
- smoke test checklist

- [ ] **Step 6: 테스트 작성**

```text
GET /api/admin/system/health as admin -> 200
GET /api/admin/backup-runs as user -> 403
```

- [ ] **Step 7: 확인**

```bash
cd backend
npm test -- tests/operations.test.ts
npm run build
cd ../frontend
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/operations backend/tests/operations.test.ts frontend/src/pages/admin/AdminOperationsPage.tsx frontend/src/components/admin/BackupRunsTable.tsx frontend/src/lib/operationsApi.ts
git commit -m "feat(ops): add operations health and backup history"
```

---

## Task 16: CI/CD Production Smoke Test 강화

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Create: `backend/scripts/smoke-prod.sh`
- Create/Modify: `docs/operations/production-checklist.md`
- Optional Modify: `docker-compose.prod.yml`

- [ ] **Step 1: CI baseline 확인**

현재 workflow가 없거나 부족하면 다음 job을 추가한다.

```text
backend install/build/test
frontend install/build
prisma validate
Docker build
```

- [ ] **Step 2: smoke-prod script 작성**

검증 endpoint:

```text
/api/health
/
/profile
/portfolio
/sitemap.xml
/robots.txt
```

Script 예시:

```bash
./backend/scripts/smoke-prod.sh https://crochub.example.com
```

- [ ] **Step 3: deploy 후 smoke test 연결**

GitHub Actions deploy 후 remote 서버 또는 public URL에 smoke test를 실행한다.

- [ ] **Step 4: rollback guide 문서화**

production-checklist에 다음 포함:
- 실패 시 이전 image/tag로 rollback
- DB migration 실패 대응
- smoke test 실패 시 배포 중단

- [ ] **Step 5: secret 사용 주의**

GitHub Actions secret 이름만 문서화하고 실제 값은 커밋하지 않는다.

- [ ] **Step 6: workflow syntax 확인**

가능하면 actionlint가 있으면 실행한다. 없으면 YAML syntax만 확인한다.

```bash
python - <<'PY'
import yaml, pathlib
for p in pathlib.Path('.github/workflows').glob('*.yml'):
    yaml.safe_load(p.read_text())
    print(p)
PY
```

- [ ] **Step 7: Commit**

```bash
git add .github/workflows backend/scripts/smoke-prod.sh docs/operations/production-checklist.md docker-compose.prod.yml
git commit -m "ci: add production smoke tests"
```

---

## Task 17: API Contract / README / Operations 문서 최종화

**Files:**
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Modify: `README.md`
- Modify: `docs/operations/backup-restore.md`
- Modify: `docs/operations/incident-response.md`
- Modify: `docs/operations/production-checklist.md`
- Modify: `docs/superpowers/plans/2026-05-06-plan8-production-hardening-analytics-deployment-polish.md`

- [ ] **Step 1: API contract 업데이트 확인**

반드시 포함:
- audit logs endpoint
- analytics ingest/admin endpoints
- sitemap/robots routes
- media derivatives endpoints
- operations/system health endpoints
- RATE_LIMITED error code
- privacy/retention notes

- [ ] **Step 2: README 운영 섹션 추가**

포함:
- production env 주의사항
- backup/restore 링크
- analytics privacy policy 요약
- sitemap/robots 확인 방법
- smoke test 실행 방법

- [ ] **Step 3: operations docs 링크 정리**

README에서 `docs/operations/*`로 연결한다.

- [ ] **Step 4: Plan 8 체크박스 상태 반영**

구현 완료된 Task/Step은 `[x]`로 업데이트한다.

- [ ] **Step 5: 확인**

```bash
git diff --check
```

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/api/2026-05-06-backend-api-contract.md README.md docs/operations docs/superpowers/plans/2026-05-06-plan8-production-hardening-analytics-deployment-polish.md
git commit -m "docs: finalize production hardening runbooks"
```

---

## Task 18: 전체 회귀 검증

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

- [ ] **Step 4: Docker local smoke test**

```bash
docker compose up --build -d
curl http://localhost/api/health
curl http://localhost/sitemap.xml
curl http://localhost/robots.txt
```

Expected:
- health 200
- sitemap XML 200
- robots text 200

- [ ] **Step 5: Rate limit smoke test**

짧은 loop로 auth endpoint rate limit을 확인한다. 운영 DB에 영향을 주지 않도록 test/local 환경에서만 실행한다.

- [ ] **Step 6: Backup script syntax check**

```bash
bash -n backend/scripts/backup-db.sh
bash -n backend/scripts/restore-db.sh
bash -n backend/scripts/smoke-prod.sh
```

- [ ] **Step 7: Admin route smoke test**

```text
/admin/analytics
/admin/audit-logs
/admin/operations
```

Expected:
- 미로그인 redirect
- 일반 user 접근 차단
- admin 접근 가능

- [ ] **Step 8: 최종 Commit**

```bash
git add .
git commit -m "chore: complete production hardening analytics deployment polish"
```

---

## 완료 기준

- [ ] 관리자 mutation 감사 로그가 저장되고 `/admin/audit-logs`에서 조회 가능함
- [ ] 방문자 analytics event가 privacy-conscious 방식으로 수집됨
- [ ] `/admin/analytics`에서 page view/route/event summary를 볼 수 있음
- [ ] `/sitemap.xml`과 `/robots.txt`가 production URL 기준으로 정상 응답함
- [ ] 이미지 업로드 시 thumbnail/web optimized derivative 생성 또는 regenerate가 가능함
- [ ] frontend가 optimized derivative를 우선 사용하고 lazy loading/aspect-ratio를 적용함
- [ ] nginx/API cache headers가 production 정책에 맞게 정리됨
- [ ] backup/restore script와 runbook이 존재함
- [ ] rate limiting과 spam protection이 auth/comment/analytics 주요 endpoint에 적용됨
- [ ] CI/CD가 backend/frontend build/test 및 production smoke test를 포함함
- [ ] API contract 문서가 Plan 8 변경사항을 반영함
- [ ] `cd backend && npm run build && npm test` PASS
- [ ] `cd frontend && npm run build` PASS
- [ ] Docker smoke test에서 `/api/health`, `/sitemap.xml`, `/robots.txt` 정상 응답

---

## Plan 9로 넘길 내용

Plan 8 완료 후 다음 계획은 `Plan 9: Community Safety + Growth Features`로 진행한다.

Plan 9 후보 범위:
- 댓글 신고/report workflow
- 관리자 moderation queue 고도화
- 사용자 notification center
- 이메일 알림 또는 digest
- 고급 검색(full-text search)
- 태그/컬렉션 기반 탐색 UX
- public guestbook 고도화
- 커뮤니티 가이드라인/정책 페이지
