# CrocHub — Plan 9: Community Safety + Growth Features 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~3 Backend Core/API Contract 완료 + Plan 4 Frontend Foundation/Public Pages 완료 + Plan 5 Admin Dashboard/Content Management 완료 + Plan 6 Admin Advanced Operations/PWA Management 완료 + Plan 7 Portfolio Expansion/Personal Branding 완료 + Plan 8 Production Hardening/Analytics/Deployment Polish 완료

**Goal:** CrocHub의 방문자 소통 기능을 안전하게 확장한다. 댓글 신고/report workflow, 관리자 moderation queue, 사용자 notification center, 이메일 알림/digest, 고급 검색, 태그/컬렉션 탐색, public guestbook, 커뮤니티 가이드라인/정책 페이지를 구현해 “방문자가 참여할 수 있지만 운영자가 통제 가능한 커뮤니티형 개인 플랫폼”으로 발전시킨다.

**중요:** Plan 9는 growth 기능을 추가하지만 안전과 운영 통제권이 우선이다. 사용자가 생성하는 모든 콘텐츠(댓글, 방명록, 신고, 프로필 일부)는 rate limit, moderation, audit/analytics, privacy 정책과 연결되어야 한다. 고등학생 개인 홈페이지라는 맥락상 과도한 공개 개인정보 수집/노출을 피하고, 관리자에게 숨김/차단/신고 처리 도구를 제공한다.

**Architecture:**
- Backend는 comments/notifications/search/tags/guestbook/moderation 모듈을 추가하거나 기존 comments/admin 모듈을 확장한다.
- Search는 초기에는 MySQL FULLTEXT 또는 Prisma query 기반으로 시작하고, 외부 검색 엔진 도입은 후속 Plan으로 넘긴다.
- Notification center는 DB 저장형 in-app notification을 우선 구현하고, Plan 6 push/Plan 9 email은 notification preference와 연결한다.
- Admin moderation queue는 comment reports, guestbook reports, spam signals를 한 곳에서 처리한다.
- Frontend는 public 참여 UI와 admin moderation UI를 분리하고, 모든 사용자 action에 loading/error/empty/success state를 제공한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + React Router + Express + Prisma + MySQL FULLTEXT + Web Push API + optional SMTP/email provider

---

## Plan 9 범위

이번 Plan의 확정 범위:

```text
Community Safety
- 댓글 신고/report workflow
- 관리자 moderation queue 고도화
- 댓글/방명록 숨김, 복원, 신고 처리 상태 관리
- 커뮤니티 가이드라인/정책 페이지

User Growth
- 사용자 notification center
- 알림 preference 관리
- 이메일 알림 또는 digest 기반 설계/초기 구현

Discovery
- 고급 검색(full-text search)
- 태그/컬렉션 기반 탐색 UX
- public guestbook 고도화

Admin
- /admin/moderation
- /admin/reports
- /admin/notifications
- /admin/tags
- /admin/collections
```

이번 Plan에서 하지 않는 것:

```text
실시간 채팅
DM/개인 메시지
소셜 네트워크 feed ranking
외부 검색 엔진(Elasticsearch/Meilisearch) production 도입
복잡한 ML spam classifier
유료 이메일 마케팅 자동화
사용자 간 팔로우/friend graph
```

---

## Safety 원칙

1. **신고는 쉽고, 남용은 제한한다**
   - 로그인 사용자만 신고 가능하게 시작한다.
   - 같은 사용자가 같은 대상에 중복 신고하지 못하게 한다.
   - 신고 생성도 rate limit 대상이다.

2. **숨김/삭제는 reversible 우선**
   - 댓글/방명록은 hard delete보다 `isHidden`, `hiddenReason`, `moderatedAt` 형태의 soft moderation을 우선한다.
   - 관리자 실수 복구가 가능해야 한다.

3. **알림은 opt-in과 preference를 존중한다**
   - in-app notification은 기본 제공 가능하다.
   - push/email은 사용자 opt-in과 preference를 따른다.

4. **검색은 공개 가능 콘텐츠만 노출한다**
   - unpublished, hidden, admin-only 데이터는 public search 결과에서 제외한다.

5. **정책 페이지는 기능과 함께 배포한다**
   - 신고/방명록/댓글 UX를 확장하기 전에 community guidelines와 privacy note를 public하게 제공한다.

---

## 데이터 모델 확장 제안

### comment_reports

```text
id                    INT PK
comment_id            INT FK
reporter_user_id      INT FK
reason                ENUM('spam','harassment','personal_info','inappropriate','other')
description           TEXT nullable
status                ENUM('open','reviewing','resolved','rejected')
resolution_note       TEXT nullable
resolved_by_admin_id  INT FK nullable
created_at            DATETIME
updated_at            DATETIME
```

### guestbook_entries

```text
id                    INT PK
user_id               INT FK nullable
nickname              VARCHAR(80) nullable
body                  TEXT
is_hidden             BOOLEAN
hidden_reason         VARCHAR(200) nullable
moderated_by_admin_id INT FK nullable
created_at            DATETIME
updated_at            DATETIME
```

### guestbook_reports

```text
id                    INT PK
guestbook_entry_id    INT FK
reporter_user_id      INT FK
reason                ENUM('spam','harassment','personal_info','inappropriate','other')
description           TEXT nullable
status                ENUM('open','reviewing','resolved','rejected')
resolved_by_admin_id  INT FK nullable
created_at            DATETIME
updated_at            DATETIME
```

### notifications

```text
id                    INT PK
user_id               INT FK
type                  VARCHAR(120)      # comment_reply, report_resolved, new_post, digest
 title                VARCHAR(160)
body                  TEXT
url                   VARCHAR(500) nullable
is_read               BOOLEAN
metadata              JSON nullable
created_at            DATETIME
read_at               DATETIME nullable
```

### notification_preferences

```text
id                    INT PK
user_id               INT FK UNIQUE
in_app_enabled        BOOLEAN
push_enabled          BOOLEAN
email_enabled         BOOLEAN
comment_replies       BOOLEAN
new_posts             BOOLEAN
moderation_updates    BOOLEAN
weekly_digest         BOOLEAN
updated_at            DATETIME
```

### tags

```text
id                    INT PK
name                  VARCHAR(80) UNIQUE
slug                  VARCHAR(100) UNIQUE
description           TEXT nullable
color                 VARCHAR(20) nullable
created_at            DATETIME
updated_at            DATETIME
```

### collections

```text
id                    INT PK
title                 VARCHAR(160)
slug                  VARCHAR(180) UNIQUE
description           TEXT nullable
cover_media_id        INT FK nullable
item_refs             JSON              # [{ type: 'post'|'showcase'|'media', id: 1 }]
is_published          BOOLEAN
order                 INT
created_at            DATETIME
updated_at            DATETIME
```

### content_tags

```text
id                    INT PK
tag_id                INT FK
content_type          VARCHAR(40)       # post, showcase, media, collection
content_id            INT
created_at            DATETIME
```

---

## Backend API 확장 제안

```text
Reports / Moderation
POST   /api/comments/:id/reports                         user+
GET    /api/admin/reports?type=&status=&page=&limit=      admin
PATCH  /api/admin/reports/:type/:id/status                admin
GET    /api/admin/moderation/queue?status=&kind=          admin
PATCH  /api/admin/comments/:id/moderation                 admin
PATCH  /api/admin/guestbook/:id/moderation                admin

Guestbook
GET    /api/guestbook?page=&limit=                        public
POST   /api/guestbook                                     public or user+ policy decision
POST   /api/guestbook/:id/reports                         user+

Notifications
GET    /api/notifications?page=&limit=&unreadOnly=         user+
PATCH  /api/notifications/:id/read                        user+
PATCH  /api/notifications/read-all                        user+
GET    /api/notification-preferences                       user+
PUT    /api/notification-preferences                       user+
POST   /api/admin/notifications/broadcast                  admin optional

Email Digest
POST   /api/admin/email/digest/test                        admin optional
POST   /api/jobs/email-digest                              internal/cron protected

Search
GET    /api/search?q=&type=&category=&tag=&page=&limit=    public

Tags / Collections
GET    /api/tags                                           public
GET    /api/tags/:slug                                     public
GET    /api/collections                                    public
GET    /api/collections/:slug                              public
POST   /api/admin/tags                                     admin
PUT    /api/admin/tags/:id                                 admin
DELETE /api/admin/tags/:id                                 admin
POST   /api/admin/collections                              admin
PUT    /api/admin/collections/:id                          admin
DELETE /api/admin/collections/:id                          admin
```

**정책 결정 필요:** `POST /api/guestbook`을 public으로 열지 user+로 제한할지 결정해야 한다. 권장 초기값은 `user+`다. public guestbook은 spam 방어가 충분한 뒤 확장한다.

---

## 파일 구조 맵

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── modules/
│   │   ├── reports/
│   │   │   ├── reports.router.ts
│   │   │   ├── reports.service.ts
│   │   │   └── reports.types.ts
│   │   ├── moderation/
│   │   │   ├── moderation.router.ts
│   │   │   ├── moderation.service.ts
│   │   │   └── moderation.types.ts
│   │   ├── guestbook/
│   │   │   ├── guestbook.router.ts
│   │   │   ├── guestbook.service.ts
│   │   │   └── guestbook.types.ts
│   │   ├── notifications/
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.service.ts
│   │   │   └── notifications.types.ts
│   │   ├── search/
│   │   │   ├── search.router.ts
│   │   │   ├── search.service.ts
│   │   │   └── search.types.ts
│   │   ├── tags/
│   │   │   ├── tags.router.ts
│   │   │   ├── tags.service.ts
│   │   │   └── tags.types.ts
│   │   └── collections/
│   │       ├── collections.router.ts
│   │       ├── collections.service.ts
│   │       └── collections.types.ts
│   └── jobs/
│       └── emailDigest.job.ts
├── tests/
│   ├── reports.test.ts
│   ├── moderation.test.ts
│   ├── guestbook.test.ts
│   ├── notifications.test.ts
│   ├── search.test.ts
│   ├── tags.test.ts
│   └── collections.test.ts

frontend/
├── src/
│   ├── lib/
│   │   ├── reportsApi.ts
│   │   ├── guestbookApi.ts
│   │   ├── notificationsApi.ts
│   │   ├── searchApi.ts
│   │   ├── tagsApi.ts
│   │   └── collectionsApi.ts
│   ├── hooks/
│   │   ├── useReportComment.ts
│   │   ├── useGuestbook.ts
│   │   ├── useNotifications.ts
│   │   ├── useSearch.ts
│   │   ├── useTags.ts
│   │   └── useCollections.ts
│   ├── components/
│   │   ├── safety/
│   │   │   ├── ReportDialog.tsx
│   │   │   ├── ModerationStatusBadge.tsx
│   │   │   └── CommunityGuidelinesLink.tsx
│   │   ├── notifications/
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── NotificationList.tsx
│   │   │   └── NotificationPreferencesForm.tsx
│   │   ├── search/
│   │   │   ├── SearchBox.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── SearchFilters.tsx
│   │   ├── tags/
│   │   │   ├── TagPill.tsx
│   │   │   ├── TagCloud.tsx
│   │   │   └── CollectionCard.tsx
│   │   └── admin/
│   │       ├── ModerationQueueTable.tsx
│   │       ├── ReportReviewPanel.tsx
│   │       ├── TagEditorForm.tsx
│   │       ├── CollectionEditorForm.tsx
│   │       └── BroadcastNotificationForm.tsx
│   └── pages/
│       ├── GuestbookPage.tsx
│       ├── SearchPage.tsx
│       ├── TagsPage.tsx
│       ├── TagDetailPage.tsx
│       ├── CollectionsPage.tsx
│       ├── CollectionDetailPage.tsx
│       ├── CommunityGuidelinesPage.tsx
│       ├── PrivacySafetyPage.tsx
│       ├── notifications/
│       │   ├── NotificationsPage.tsx
│       │   └── NotificationPreferencesPage.tsx
│       └── admin/
│           ├── AdminModerationPage.tsx
│           ├── AdminReportsPage.tsx
│           ├── AdminNotificationsPage.tsx
│           ├── AdminTagsPage.tsx
│           └── AdminCollectionsPage.tsx
```

---

## Route 설계

### Public/User

```text
/guestbook                       방명록
/search                          통합 검색
/tags                            태그 목록
/tags/:slug                      태그별 콘텐츠
/collections                     컬렉션 목록
/collections/:slug               컬렉션 상세
/community-guidelines            커뮤니티 가이드라인
/privacy-safety                  개인정보/안전 정책 요약
/notifications                   사용자 알림함(user+)
/notifications/preferences       알림 설정(user+)
```

### Admin

```text
/admin/moderation                moderation queue
/admin/reports                   신고 목록/처리
/admin/notifications             broadcast/digest 관리
/admin/tags                      태그 관리
/admin/collections               컬렉션 관리
```

---

## Task 1: Plan 8 결과 확인 및 Community 라우트 준비

**Files:**
- Inspect/Modify: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Inspect/Modify: `frontend/src/components/layout/*`
- Inspect/Modify: `frontend/src/components/admin/AdminNav.tsx`
- Create: public/user page placeholders
- Create: admin page placeholders

- [ ] **Step 1: Plan 8 완료 상태 확인**

```bash
find frontend/src -maxdepth 4 -type f | sort
find backend/src/modules -maxdepth 2 -type f | sort
```

Expected:
- audit/analytics/operations 기능 존재
- admin shell/nav 존재
- production hardening 문서 존재

- [ ] **Step 2: public/user routes 추가**

```text
/guestbook
/search
/tags
/tags/:slug
/collections
/collections/:slug
/community-guidelines
/privacy-safety
/notifications
/notifications/preferences
```

- [ ] **Step 3: admin routes 추가**

```text
/admin/moderation
/admin/reports
/admin/notifications
/admin/tags
/admin/collections
```

- [ ] **Step 4: route guard 정책 확인**

- `/notifications`, `/notifications/preferences`는 user+ 전용
- admin routes는 admin 전용
- policy pages는 public

- [ ] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(community): prepare safety and growth routes"
```

---

## Task 2: 댓글 신고 Report Workflow API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/reports/reports.router.ts`
- Create: `backend/src/modules/reports/reports.service.ts`
- Create: `backend/src/modules/reports/reports.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/reports.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: comment_reports model 추가**

중복 신고 방지를 위해 `(commentId, reporterUserId)` unique index를 권장한다.

- [ ] **Step 2: 댓글 신고 endpoint 구현**

```text
POST /api/comments/:id/reports user+
```

Request:

```json
{
  "reason": "spam",
  "description": "같은 링크를 반복해서 올립니다."
}
```

- [ ] **Step 3: validation 규칙**

- reason: allowlist
- description: optional, max 1000
- hidden/deleted comment 신고 가능 여부 정책 결정
- 동일 사용자의 동일 댓글 중복 신고는 409 `ALREADY_REPORTED`

- [ ] **Step 4: 신고 생성 시 moderation signal 생성**

신고 status는 `open`으로 시작하고, admin moderation queue에서 볼 수 있게 한다.

- [ ] **Step 5: 테스트 작성**

```text
POST /api/comments/:id/reports without token -> 401
POST /api/comments/:id/reports invalid reason -> 400
POST /api/comments/:id/reports as user -> 201
POST duplicate report -> 409 ALREADY_REPORTED
```

- [ ] **Step 6: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/reports.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/reports backend/src/app.ts backend/tests/reports.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(reports): add comment report workflow"
```

---

## Task 3: Public Report Dialog UI 구현

**Files:**
- Create: `frontend/src/lib/reportsApi.ts`
- Create: `frontend/src/hooks/useReportComment.ts`
- Create: `frontend/src/components/safety/ReportDialog.tsx`
- Create: `frontend/src/components/safety/CommunityGuidelinesLink.tsx`
- Modify: comment components in post detail
- Modify: `frontend/src/types` as needed

- [ ] **Step 1: reports API client 작성**

```typescript
reportComment(commentId, { reason, description })
```

- [ ] **Step 2: ReportDialog 구현**

필드:
- reason select
- description textarea
- community guideline link

- [ ] **Step 3: comment action에 신고 버튼 추가**

정책:
- 로그인 user에게만 신고 버튼 표시
- 미로그인 사용자는 로그인 유도
- 자기 댓글 신고 가능 여부는 정책 결정. 권장: 가능하지만 UI에서는 낮은 우선순위

- [ ] **Step 4: success/error UX**

- 성공: “신고가 접수되었습니다.”
- 중복: “이미 신고한 댓글입니다.”
- validation: field-level 표시

- [ ] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/reportsApi.ts frontend/src/hooks/useReportComment.ts frontend/src/components/safety frontend/src
git commit -m "feat(safety): add comment report dialog"
```

---

## Task 4: Admin Reports + Moderation Queue API 구현

**Files:**
- Create: `backend/src/modules/moderation/moderation.router.ts`
- Create: `backend/src/modules/moderation/moderation.service.ts`
- Create: `backend/src/modules/moderation/moderation.types.ts`
- Modify: `backend/src/modules/reports/*`
- Modify: `backend/src/modules/comments/*`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/moderation.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: admin reports list 구현**

```text
GET /api/admin/reports?type=comment&status=open&page=1&limit=20
```

- [ ] **Step 2: report status update 구현**

```text
PATCH /api/admin/reports/comment/:id/status
```

Request:

```json
{
  "status": "resolved",
  "resolutionNote": "숨김 처리 완료"
}
```

- [ ] **Step 3: moderation queue 구현**

```text
GET /api/admin/moderation/queue?status=open&kind=comment
```

Queue에는 다음을 포함한다.
- 신고된 댓글
- 신고된 방명록
- spam guard에 걸린 항목(optional)

- [ ] **Step 4: comment moderation endpoint 구현**

```text
PATCH /api/admin/comments/:id/moderation
```

Request:

```json
{
  "isHidden": true,
  "hiddenReason": "spam"
}
```

- [ ] **Step 5: audit log 연결**

Plan 8 audit log가 있으면 다음 action 기록:

```text
report.resolve
comment.moderate
moderation.queue.review
```

- [ ] **Step 6: 테스트 작성**

```text
GET /api/admin/reports as user -> 403
GET /api/admin/reports as admin -> 200
PATCH report status as admin -> 200
PATCH comment moderation hidden -> 200
moderation action creates audit log if audit module exists
```

- [ ] **Step 7: 확인**

```bash
cd backend
npm test -- tests/moderation.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add backend/src/modules/moderation backend/src/modules/reports backend/src/modules/comments backend/src/app.ts backend/tests/moderation.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(moderation): add admin reports queue"
```

---

## Task 5: Admin Moderation UI 구현

**Files:**
- Create: `frontend/src/pages/admin/AdminModerationPage.tsx`
- Create: `frontend/src/pages/admin/AdminReportsPage.tsx`
- Create: `frontend/src/components/admin/ModerationQueueTable.tsx`
- Create: `frontend/src/components/admin/ReportReviewPanel.tsx`
- Create: `frontend/src/components/safety/ModerationStatusBadge.tsx`
- Modify: `frontend/src/lib/reportsApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: moderation API client 작성**

```typescript
getAdminReports(params)
updateReportStatus(type, id, payload)
getModerationQueue(params)
moderateComment(id, payload)
```

- [ ] **Step 2: moderation queue table 구현**

컬럼:
- kind
- target summary
- report count
- latest reason
- status
- createdAt
- actions

- [ ] **Step 3: report review panel 구현**

관리자가 신고 상세와 원문 댓글/방명록을 보고 처리할 수 있게 한다.

- [ ] **Step 4: quick actions 구현**

- hide target
- unhide target
- resolve report
- reject report
- open public context

- [ ] **Step 5: loading/error/empty state**

신고가 없는 상태는 “현재 검토할 신고가 없습니다.”로 표시한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminModerationPage.tsx frontend/src/pages/admin/AdminReportsPage.tsx frontend/src/components/admin/ModerationQueueTable.tsx frontend/src/components/admin/ReportReviewPanel.tsx frontend/src/components/safety/ModerationStatusBadge.tsx frontend/src/lib/reportsApi.ts frontend/src/types/admin.ts
git commit -m "feat(admin): add moderation queue UI"
```

---

## Task 6: Public Guestbook API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/guestbook/guestbook.router.ts`
- Create: `backend/src/modules/guestbook/guestbook.service.ts`
- Create: `backend/src/modules/guestbook/guestbook.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/guestbook.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: guestbook_entries / guestbook_reports model 추가**

초기 정책은 `POST /api/guestbook` user+ 권장.

- [ ] **Step 2: public list endpoint 구현**

```text
GET /api/guestbook?page=&limit=
```

정책:
- hidden entry는 public에서 마스킹하거나 제외한다.
- 권장: 제외. 관리자 화면에서만 hidden 표시.

- [ ] **Step 3: create endpoint 구현**

```text
POST /api/guestbook user+
```

Request:

```json
{
  "body": "응원 메시지 남기고 갑니다!"
}
```

Validation:
- body: 1~1000
- URL 과다 금지
- 동일 body 반복 방지

- [ ] **Step 4: guestbook report endpoint 구현**

```text
POST /api/guestbook/:id/reports user+
```

- [ ] **Step 5: admin moderation 연결**

`PATCH /api/admin/guestbook/:id/moderation`으로 hidden 처리 가능하게 한다.

- [ ] **Step 6: 테스트 작성**

```text
GET /api/guestbook -> 200
POST /api/guestbook without token -> 401 if user+ policy
POST /api/guestbook empty body -> 400
POST /api/guestbook as user -> 201
POST /api/guestbook/:id/reports duplicate -> 409
```

- [ ] **Step 7: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/guestbook.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/guestbook backend/src/modules/moderation backend/src/app.ts backend/tests/guestbook.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(guestbook): add moderated guestbook API"
```

---

## Task 7: Guestbook Public UI 구현

**Files:**
- Create: `frontend/src/pages/GuestbookPage.tsx`
- Create: `frontend/src/lib/guestbookApi.ts`
- Create: `frontend/src/hooks/useGuestbook.ts`
- Create: `frontend/src/components/guestbook/GuestbookEntryList.tsx`
- Create: `frontend/src/components/guestbook/GuestbookEntryForm.tsx`
- Modify: `frontend/src/components/safety/ReportDialog.tsx`

- [ ] **Step 1: guestbook API client 작성**

```typescript
getGuestbookEntries(params)
createGuestbookEntry(payload)
reportGuestbookEntry(id, payload)
```

- [ ] **Step 2: GuestbookPage 구현**

구성:
- intro card
- community guidelines link
- entry form(user+)
- entry list
- pagination/load more

- [ ] **Step 3: 미로그인 UX**

미로그인 사용자는 “로그인하고 방명록 남기기” CTA를 본다.

- [ ] **Step 4: 신고 연동**

방명록 entry에도 ReportDialog를 재사용한다.

- [ ] **Step 5: empty/error state**

첫 방명록을 유도하는 empty state를 제공한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/GuestbookPage.tsx frontend/src/lib/guestbookApi.ts frontend/src/hooks/useGuestbook.ts frontend/src/components/guestbook frontend/src/components/safety/ReportDialog.tsx
git commit -m "feat(guestbook): add public guestbook experience"
```

---

## Task 8: Notification Center API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/notifications/notifications.router.ts`
- Create: `backend/src/modules/notifications/notifications.service.ts`
- Create: `backend/src/modules/notifications/notifications.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/notifications.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: notifications / notification_preferences model 추가**

user별 preferences는 user 생성 시 기본값을 만들거나 첫 조회 시 upsert한다.

- [ ] **Step 2: notification list endpoint 구현**

```text
GET /api/notifications?page=&limit=&unreadOnly=
```

- [ ] **Step 3: read endpoints 구현**

```text
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

- [ ] **Step 4: preferences endpoints 구현**

```text
GET /api/notification-preferences
PUT /api/notification-preferences
```

- [ ] **Step 5: notification 생성 service 작성**

```typescript
createNotification({ userId, type, title, body, url, metadata })
```

연결 후보:
- 관리자 댓글 답변 → 댓글 작성자에게 알림
- 신고 처리 완료 → 신고자에게 알림(optional)
- 새 게시물 발행 → preference enabled 사용자에게 알림(optional)

- [ ] **Step 6: 테스트 작성**

```text
GET /api/notifications without token -> 401
GET /api/notifications as user -> 200
PATCH notification read by owner -> 200
PATCH another user's notification -> 404 or 403
PUT preferences invalid -> 400
```

- [ ] **Step 7: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/notifications.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/notifications backend/src/app.ts backend/tests/notifications.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(notifications): add user notification center API"
```

---

## Task 9: Notification Center Frontend 구현

**Files:**
- Create: `frontend/src/lib/notificationsApi.ts`
- Create: `frontend/src/hooks/useNotifications.ts`
- Create: `frontend/src/components/notifications/NotificationBell.tsx`
- Create: `frontend/src/components/notifications/NotificationList.tsx`
- Create: `frontend/src/components/notifications/NotificationPreferencesForm.tsx`
- Create: `frontend/src/pages/notifications/NotificationsPage.tsx`
- Create: `frontend/src/pages/notifications/NotificationPreferencesPage.tsx`
- Modify: `frontend/src/components/layout/*`

- [ ] **Step 1: notifications API client 작성**

```typescript
getNotifications(params)
markNotificationRead(id)
markAllNotificationsRead()
getNotificationPreferences()
updateNotificationPreferences(payload)
```

- [ ] **Step 2: NotificationBell 구현**

- unread count badge
- 클릭 시 `/notifications` 이동 또는 dropdown
- 모바일 header에서도 동작

- [ ] **Step 3: NotificationsPage 구현**

- unread/all filter
- notification type badge
- mark as read
- target url navigation

- [ ] **Step 4: PreferencesPage 구현**

설정:
- in-app
- push
- email
- comment replies
- new posts
- moderation updates
- weekly digest

- [ ] **Step 5: push/email preference와 Plan 6 push UX 연결**

push permission이 denied이면 pushEnabled toggle에 안내를 표시한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/notificationsApi.ts frontend/src/hooks/useNotifications.ts frontend/src/components/notifications frontend/src/pages/notifications frontend/src/components/layout
git commit -m "feat(notifications): add user notification center"
```

---

## Task 10: 이메일 알림/Digest 기반 설계 및 초기 구현

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/jobs/emailDigest.job.ts`
- Create: `backend/src/modules/notifications/email.service.ts`
- Modify: `backend/src/modules/notifications/*`
- Create/Modify: `backend/tests/email-digest.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Modify: `README.md`

- [ ] **Step 1: email provider 정책 결정**

초기 옵션:
- SMTP provider
- Resend/SendGrid 같은 API provider
- local dev에서는 log-only transport

민감 정보는 env로만 관리한다.

```text
EMAIL_PROVIDER=smtp|log
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
EMAIL_FROM
```

- [ ] **Step 2: email service 작성**

```typescript
sendEmail({ to, subject, html, text })
```

local/test 환경에서는 실제 발송하지 않는다.

- [ ] **Step 3: weekly digest job 작성**

Digest 후보:
- 새 게시물
- 답변 받은 댓글
- showcase 업데이트

- [ ] **Step 4: job 실행 방식 문서화**

초기:
- 서버 cron에서 `node dist/jobs/emailDigest.job.js`
- 또는 protected internal endpoint

- [ ] **Step 5: admin test endpoint optional**

```text
POST /api/admin/email/digest/test
```

- [ ] **Step 6: 테스트 작성**

```text
log transport records email payload
weekly digest skips users with emailEnabled=false
weekly digest includes only relevant content
```

- [ ] **Step 7: 확인**

```bash
cd backend
npm test -- tests/email-digest.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/src/jobs/emailDigest.job.ts backend/src/modules/notifications backend/tests/email-digest.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md README.md
git commit -m "feat(notifications): add email digest foundation"
```

---

## Task 11: 고급 검색 API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma` if FULLTEXT indexes needed
- Create: `backend/src/modules/search/search.router.ts`
- Create: `backend/src/modules/search/search.service.ts`
- Create: `backend/src/modules/search/search.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/search.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: 검색 범위 정의**

Public search 대상:
- published posts
- published showcase items
- published collections
- public profile/portfolio sections optional

제외:
- hidden comments
- hidden guestbook
- draft/unpublished content
- admin-only data

- [ ] **Step 2: MySQL FULLTEXT index 검토**

가능하면 다음에 index 추가:
- posts title/body
- showcase title/description
- collections title/description

Prisma migration에서 FULLTEXT 지원이 제한되면 raw SQL migration을 사용한다.

- [ ] **Step 3: search endpoint 구현**

```text
GET /api/search?q=&type=&category=&tag=&page=&limit=
```

Query validation:
- q: 1~100
- type: all|post|showcase|collection
- page positive
- limit max 50

- [ ] **Step 4: response shape 정의**

```json
{
  "data": [
    {
      "type": "post",
      "id": 1,
      "title": "...",
      "excerpt": "...",
      "url": "/post/1",
      "thumbnailUrl": "...",
      "score": 1.23
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

- [ ] **Step 5: analytics 연결**

검색어 원문 저장은 privacy 검토가 필요하다. 초기에는 검색 event에 q length/type만 저장하거나 admin analytics에 coarse data만 제공한다.

- [ ] **Step 6: 테스트 작성**

```text
GET /api/search?q=art -> 200
GET /api/search?q= -> 400
GET /api/search excludes draft posts
GET /api/search excludes hidden guestbook/comments
```

- [ ] **Step 7: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/search.test.ts
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/search backend/src/app.ts backend/tests/search.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(search): add public full text search"
```

---

## Task 12: Search UI 구현

**Files:**
- Create: `frontend/src/pages/SearchPage.tsx`
- Create: `frontend/src/lib/searchApi.ts`
- Create: `frontend/src/hooks/useSearch.ts`
- Create: `frontend/src/components/search/SearchBox.tsx`
- Create: `frontend/src/components/search/SearchResults.tsx`
- Create: `frontend/src/components/search/SearchFilters.tsx`
- Modify: `frontend/src/components/layout/*`

- [ ] **Step 1: search API client 작성**

```typescript
searchContent(params): Promise<SearchResponse>
```

- [ ] **Step 2: global search entry 추가**

Header에 search input 또는 search icon을 추가한다.

- [ ] **Step 3: SearchPage 구현**

기능:
- q query param 동기화
- type/category/tag filter
- pagination
- empty state
- loading state

- [ ] **Step 4: SearchResults 구현**

결과 type별 icon/badge와 excerpt를 표시한다.

- [ ] **Step 5: 접근성 확인**

- search input label
- keyboard submit
- result item link focus

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/SearchPage.tsx frontend/src/lib/searchApi.ts frontend/src/hooks/useSearch.ts frontend/src/components/search frontend/src/components/layout
git commit -m "feat(search): add public search experience"
```

---

## Task 13: Tags / Collections API 구현

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/tags/tags.router.ts`
- Create: `backend/src/modules/tags/tags.service.ts`
- Create: `backend/src/modules/tags/tags.types.ts`
- Create: `backend/src/modules/collections/collections.router.ts`
- Create: `backend/src/modules/collections/collections.service.ts`
- Create: `backend/src/modules/collections/collections.types.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/tags.test.ts`
- Create: `backend/tests/collections.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [ ] **Step 1: tags/collections/content_tags model 추가**

Slug unique index를 추가한다.

- [ ] **Step 2: public tags API 구현**

```text
GET /api/tags
GET /api/tags/:slug
```

Tag detail은 해당 tag가 연결된 public content를 반환한다.

- [ ] **Step 3: admin tags CRUD 구현**

```text
POST /api/admin/tags
PUT /api/admin/tags/:id
DELETE /api/admin/tags/:id
```

- [ ] **Step 4: public collections API 구현**

```text
GET /api/collections
GET /api/collections/:slug
```

public은 `isPublished=true`만 반환한다.

- [ ] **Step 5: admin collections CRUD 구현**

```text
POST /api/admin/collections
PUT /api/admin/collections/:id
DELETE /api/admin/collections/:id
```

- [ ] **Step 6: validation 규칙**

- tag name: 1~80
- slug: kebab-case, unique
- collection title: 1~160
- itemRefs는 존재하는 public/admin content id인지 검증

- [ ] **Step 7: 테스트 작성**

```text
GET /api/tags -> 200
POST /api/admin/tags duplicate slug -> 409
GET /api/collections excludes unpublished
POST /api/admin/collections invalid itemRefs -> 400
```

- [ ] **Step 8: 확인**

```bash
cd backend
npx prisma validate
npm test -- tests/tags.test.ts
npm test -- tests/collections.test.ts
npm run build
```

- [ ] **Step 9: Commit**

```bash
git add backend/prisma/schema.prisma backend/src/modules/tags backend/src/modules/collections backend/src/app.ts backend/tests/tags.test.ts backend/tests/collections.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(discovery): add tags and collections APIs"
```

---

## Task 14: Tags / Collections Public UI 구현

**Files:**
- Create: `frontend/src/pages/TagsPage.tsx`
- Create: `frontend/src/pages/TagDetailPage.tsx`
- Create: `frontend/src/pages/CollectionsPage.tsx`
- Create: `frontend/src/pages/CollectionDetailPage.tsx`
- Create: `frontend/src/lib/tagsApi.ts`
- Create: `frontend/src/lib/collectionsApi.ts`
- Create: `frontend/src/hooks/useTags.ts`
- Create: `frontend/src/hooks/useCollections.ts`
- Create: `frontend/src/components/tags/TagPill.tsx`
- Create: `frontend/src/components/tags/TagCloud.tsx`
- Create: `frontend/src/components/tags/CollectionCard.tsx`

- [ ] **Step 1: API clients 작성**

```typescript
getTags()
getTagDetail(slug)
getCollections()
getCollectionDetail(slug)
```

- [ ] **Step 2: tag cloud/list 구현**

태그별 count와 color를 표시한다.

- [ ] **Step 3: tag detail 구현**

연결된 posts/showcase/media/collections를 type별로 보여준다.

- [ ] **Step 4: collections list/detail 구현**

컬렉션은 curated story 형태로 표시한다.

- [ ] **Step 5: content card 재사용**

Plan 4~7 public card component를 가능한 재사용한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/TagsPage.tsx frontend/src/pages/TagDetailPage.tsx frontend/src/pages/CollectionsPage.tsx frontend/src/pages/CollectionDetailPage.tsx frontend/src/lib/tagsApi.ts frontend/src/lib/collectionsApi.ts frontend/src/hooks/useTags.ts frontend/src/hooks/useCollections.ts frontend/src/components/tags
git commit -m "feat(discovery): add tags and collections browsing"
```

---

## Task 15: Admin Tags / Collections UI 구현

**Files:**
- Create: `frontend/src/pages/admin/AdminTagsPage.tsx`
- Create: `frontend/src/pages/admin/AdminCollectionsPage.tsx`
- Create: `frontend/src/components/admin/TagEditorForm.tsx`
- Create: `frontend/src/components/admin/CollectionEditorForm.tsx`
- Modify: `frontend/src/lib/tagsApi.ts`
- Modify: `frontend/src/lib/collectionsApi.ts`
- Modify: `frontend/src/types/admin.ts`

- [ ] **Step 1: AdminTagsPage 구현**

기능:
- tag list
- create/edit/delete
- slug preview
- color picker

- [ ] **Step 2: AdminCollectionsPage 구현**

기능:
- collection list
- create/edit/delete
- publish toggle
- itemRefs editor
- reorder items

- [ ] **Step 3: content picker 구현**

컬렉션에 posts/showcase/media를 추가할 수 있는 picker를 제공한다.

- [ ] **Step 4: validation/error 표시**

duplicate slug, invalid itemRefs, validation details를 field-level로 표시한다.

- [ ] **Step 5: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/admin/AdminTagsPage.tsx frontend/src/pages/admin/AdminCollectionsPage.tsx frontend/src/components/admin/TagEditorForm.tsx frontend/src/components/admin/CollectionEditorForm.tsx frontend/src/lib/tagsApi.ts frontend/src/lib/collectionsApi.ts frontend/src/types/admin.ts
git commit -m "feat(admin): add tags and collections management"
```

---

## Task 16: 커뮤니티 가이드라인/정책 페이지 작성

**Files:**
- Create: `frontend/src/pages/CommunityGuidelinesPage.tsx`
- Create: `frontend/src/pages/PrivacySafetyPage.tsx`
- Modify: `frontend/src/components/layout/*`
- Modify: `README.md` optional
- Optional Create: `docs/policies/community-guidelines.md`
- Optional Create: `docs/policies/privacy-safety.md`

- [ ] **Step 1: community guidelines 초안 작성**

포함:
- 환영하는 행동
- 금지되는 행동(spam, 괴롭힘, 개인정보 노출, 부적절한 콘텐츠)
- 신고 방법
- 운영자 조치 기준

- [ ] **Step 2: privacy/safety note 작성**

포함:
- 수집하는 정보 요약
- 댓글/방명록 공개 범위
- 신고 처리 방식
- 알림 preference
- 문의/삭제 요청 방식

- [ ] **Step 3: public pages 구현**

디자인은 public profile/portfolio 톤을 유지하되 가독성을 우선한다.

- [ ] **Step 4: footer/header link 추가**

footer에 다음 link를 추가한다.

```text
Community Guidelines
Privacy & Safety
```

- [ ] **Step 5: 신고/방명록 UI와 연결**

ReportDialog와 GuestbookPage에서 guidelines link를 제공한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/CommunityGuidelinesPage.tsx frontend/src/pages/PrivacySafetyPage.tsx frontend/src/components/layout README.md docs/policies
git commit -m "docs(safety): add community guidelines pages"
```

---

## Task 17: 관리자 Broadcast Notification UI 선택 구현

**Files:**
- Create: `frontend/src/pages/admin/AdminNotificationsPage.tsx`
- Create: `frontend/src/components/admin/BroadcastNotificationForm.tsx`
- Modify: `frontend/src/lib/notificationsApi.ts`
- Optional Modify: `backend/src/modules/notifications/*`
- Optional Modify: `backend/tests/notifications.test.ts`

- [ ] **Step 1: broadcast 정책 결정**

관리자 broadcast는 남용 위험이 있으므로 초기에는 다음 중 하나로 제한한다.

권장:
- admin이 in-app notification만 broadcast 가능
- push/email broadcast는 후속 승인 flow 필요

- [ ] **Step 2: backend endpoint optional 구현**

```text
POST /api/admin/notifications/broadcast
```

Request:

```json
{
  "title": "새 포트폴리오 업데이트",
  "body": "새 작품이 올라왔어요.",
  "url": "/portfolio/showcase",
  "channels": ["in_app"]
}
```

- [ ] **Step 3: BroadcastNotificationForm 구현**

필드:
- title
- body
- url
- channel checkboxes
- recipient policy preview

- [ ] **Step 4: confirm dialog 필수**

발송 후 취소 불가하므로 confirm dialog를 둔다.

- [ ] **Step 5: audit log 연결**

Plan 8 audit log가 있으면 `notification.broadcast` 기록.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

backend 변경 시:

```bash
cd backend
npm test -- tests/notifications.test.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/admin/AdminNotificationsPage.tsx frontend/src/components/admin/BroadcastNotificationForm.tsx frontend/src/lib/notificationsApi.ts backend/src/modules/notifications backend/tests/notifications.test.ts
git commit -m "feat(admin): add broadcast notification controls"
```

---

## Task 18: 접근성/반응형/Safety 회귀 검증

**Files:**
- Modify as needed: `frontend/src/components/safety/*`
- Modify as needed: `frontend/src/components/notifications/*`
- Modify as needed: `frontend/src/components/search/*`
- Modify as needed: public/admin pages

- [ ] **Step 1: public route responsive 확인**

```text
/guestbook
/search
/tags
/tags/:slug
/collections
/collections/:slug
/community-guidelines
/privacy-safety
/notifications
/notifications/preferences
```

- [ ] **Step 2: admin route responsive 확인**

```text
/admin/moderation
/admin/reports
/admin/notifications
/admin/tags
/admin/collections
```

- [ ] **Step 3: keyboard accessibility 확인**

특히 확인:
- ReportDialog open/close/focus
- NotificationBell
- search filters
- tag/collection editor add/remove/reorder
- moderation queue actions

- [ ] **Step 4: abuse case smoke test**

```text
중복 신고
짧은 시간 반복 방명록 작성
hidden 댓글/방명록 public 노출 여부
미로그인 알림함 접근
일반 user admin moderation 접근
```

- [ ] **Step 5: screenshot 캡처**

웹 앱 시각 변경이 크므로 최소 다음 스크린샷을 남긴다.

```text
/guestbook
/search?q=test
/tags
/collections
/notifications
/admin/moderation
/admin/reports
/admin/tags
/admin/collections
```

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "fix(community): polish safety and growth UX"
```

---

## Task 19: API Contract / README 문서 최종화

**Files:**
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-05-06-plan9-community-safety-growth-features.md`
- Optional Modify: `docs/policies/community-guidelines.md`
- Optional Modify: `docs/policies/privacy-safety.md`

- [ ] **Step 1: API contract 업데이트 확인**

반드시 포함:
- comment report endpoints
- admin reports/moderation endpoints
- guestbook endpoints
- notification center/preferences endpoints
- email digest 운영 방식
- search endpoint
- tags/collections endpoints
- new error codes: `ALREADY_REPORTED`, `REPORT_NOT_FOUND`, `NOTIFICATION_NOT_FOUND`, `DUPLICATE_SLUG`

- [ ] **Step 2: README 커뮤니티 기능 사용법 추가**

포함:
- 방명록 사용법
- 신고/처리 흐름
- 알림 설정
- 검색/태그/컬렉션 관리
- moderation 운영 주의사항

- [ ] **Step 3: policy docs 최종 확인**

커뮤니티 가이드라인과 privacy/safety note가 실제 route와 링크되어 있는지 확인한다.

- [ ] **Step 4: Plan 9 체크박스 상태 반영**

구현 완료된 Task/Step은 `[x]`로 업데이트한다.

- [ ] **Step 5: 확인**

```bash
git diff --check
```

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/api/2026-05-06-backend-api-contract.md README.md docs/superpowers/plans/2026-05-06-plan9-community-safety-growth-features.md docs/policies
git commit -m "docs: finalize community safety growth plan"
```

---

## Task 20: 전체 회귀 검증

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
/guestbook
/search
/tags
/collections
/community-guidelines
/privacy-safety
```

Expected:
- SPA route 정상 렌더
- loading/error/empty state 정상

- [ ] **Step 6: User route smoke test**

```text
/notifications
/notifications/preferences
```

Expected:
- 미로그인 redirect
- 로그인 user 접근 가능

- [ ] **Step 7: Admin route smoke test**

```text
/admin/moderation
/admin/reports
/admin/notifications
/admin/tags
/admin/collections
```

Expected:
- 미로그인 redirect
- 일반 user 접근 차단
- admin 접근 가능

- [ ] **Step 8: Abuse prevention smoke test**

```text
중복 신고 -> ALREADY_REPORTED
hidden content public 미노출
rate limit 초과 -> RATE_LIMITED
admin moderation action -> audit log 생성
```

- [ ] **Step 9: 최종 Commit**

```bash
git add .
git commit -m "chore: complete community safety and growth features"
```

---

## 완료 기준

- [ ] 댓글 신고 workflow가 user+로 동작하고 중복 신고를 막음
- [ ] `/admin/moderation`에서 신고/검토 queue를 처리할 수 있음
- [ ] 댓글/방명록 숨김/복원 moderation이 가능함
- [ ] `/guestbook` public 방명록이 정책에 맞게 동작함
- [ ] `/notifications` 사용자 알림함과 읽음 처리가 동작함
- [ ] `/notifications/preferences`에서 in-app/push/email/digest 설정을 관리할 수 있음
- [ ] 이메일 digest 기반 구현 또는 운영 설계가 문서화됨
- [ ] `/search` 고급 검색이 공개 콘텐츠만 반환함
- [ ] `/tags`, `/tags/:slug`, `/collections`, `/collections/:slug` 탐색 UX가 동작함
- [ ] `/admin/tags`, `/admin/collections`에서 태그/컬렉션을 관리할 수 있음
- [ ] community guidelines/privacy safety 페이지가 public하게 제공됨
- [ ] abuse prevention smoke test가 통과함
- [ ] API contract 문서가 Plan 9 변경사항을 반영함
- [ ] `cd backend && npm run build && npm test` PASS
- [ ] `cd frontend && npm run build` PASS
- [ ] Docker smoke test에서 `/api/health` 정상 응답

---

## Plan 10로 넘길 내용

Plan 9 완료 후 다음 계획은 `Plan 10: Mobile App + Offline Experience`로 진행한다.

Plan 10 후보 범위:
- React Native 또는 Capacitor 기반 모바일 앱 결정
- offline-first reading cache
- background sync for comments/guestbook drafts
- mobile notification deep links
- native share target
- app store deployment checklist
- device-specific media upload UX
- mobile accessibility QA
