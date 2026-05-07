# CrocHub — Plan 9: Community Safety + Moderation 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~3 Backend Core/API Contract 완료 + Plan 4 Frontend Foundation/Public Pages 완료 + Plan 5 Admin Dashboard/Content Management 완료 + Plan 6 Admin Advanced Operations/PWA Management 완료 + Plan 7 Portfolio Expansion/Personal Branding 완료 + Plan 8 Production Hardening/Analytics/Deployment Polish 완료

**Goal:** CrocHub 방문자 소통 기능을 안전하게 확장한다. 댓글 신고/report workflow, 관리자 moderation queue, 방명록(guestbook), 커뮤니티 가이드라인/정책 페이지를 구현해 "방문자가 참여할 수 있지만 운영자가 통제 가능한" 기반을 만든다.

**중요:** 안전과 운영 통제권이 성장 기능보다 우선이다. 사용자가 생성하는 모든 콘텐츠(댓글, 방명록, 신고)는 rate limit, moderation, Plan 8 audit log와 연결되어야 한다. 고등학생 개인 홈페이지라는 맥락상 과도한 공개 개인정보 수집/노출을 피하고, 관리자에게 숨김/차단/신고 처리 도구를 제공한다.

**Architecture:**
- Backend는 reports/moderation/guestbook 모듈을 추가하거나 기존 comments/admin 모듈을 확장한다.
- Admin moderation queue는 comment reports, guestbook reports, spam signals를 한 곳에서 처리한다.
- Frontend는 public 참여 UI와 admin moderation UI를 분리하고, 모든 사용자 action에 loading/error/empty/success state를 제공한다.
- Plan 8 audit log와 연결해 moderation 행동을 기록한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + React Router + Express + Prisma + MySQL

---

## Plan 9 범위

이번 Plan의 확정 범위:

```text
Community Safety
- 댓글 신고/report workflow
- 관리자 moderation queue 고도화
- 댓글/방명록 숨김, 복원, 신고 처리 상태 관리
- 커뮤니티 가이드라인/정책 페이지

Guestbook
- 방명록 공개 조회 (public) / 작성 (user+)
- 방명록 신고 workflow
- 관리자 방명록 moderation
```

이번 Plan에서 하지 않는 것:

```text
알림 센터                      (→ Plan 9B)
이메일 다이제스트               (→ Plan 9B)
고급 검색                      (→ Plan 9B)
태그/컬렉션                    (→ Plan 9B)
실시간 채팅
DM/개인 메시지
복잡한 ML spam classifier
```

---

## Safety 원칙

1. **신고는 쉽고, 남용은 제한한다**
   - 로그인 사용자만 신고 가능하게 시작한다.
   - 같은 사용자가 같은 대상에 중복 신고하지 못하게 한다.
   - 신고 생성도 Plan 8 rate limit 대상이다.

2. **숨김/삭제는 reversible 우선**
   - 댓글/방명록은 hard delete보다 `isHidden`, `hiddenReason`, `moderatedAt` 형태의 soft moderation을 우선한다.
   - 관리자 실수 복구가 가능해야 한다.

3. **정책 페이지는 기능과 함께 배포한다**
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
UNIQUE INDEX (comment_id, reporter_user_id)   -- 중복 신고 방지
```

### guestbook_entries

```text
id                    INT PK
user_id               INT FK nullable
nickname              VARCHAR(80) nullable
body                  TEXT
is_hidden             BOOLEAN DEFAULT FALSE
hidden_reason         VARCHAR(200) nullable
moderated_by_admin_id INT FK nullable
moderated_at          DATETIME nullable
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
resolution_note       TEXT nullable
resolved_by_admin_id  INT FK nullable
created_at            DATETIME
updated_at            DATETIME
UNIQUE INDEX (guestbook_entry_id, reporter_user_id)   -- 중복 신고 방지
```

---

## Backend API 확장 제안

```text
Reports / Moderation
POST   /api/comments/:id/reports                              user+
GET    /api/admin/reports?type=&status=&page=&limit=          admin
PATCH  /api/admin/reports/:type/:id/status                    admin
GET    /api/admin/moderation/queue?status=&kind=              admin
PATCH  /api/admin/comments/:id/moderation                     admin
PATCH  /api/admin/guestbook/:id/moderation                    admin

Guestbook
GET    /api/guestbook?page=&limit=                            public
POST   /api/guestbook                                         user+
POST   /api/guestbook/:id/reports                             user+
```

**정책:** `POST /api/guestbook`는 user+로 시작한다. public guestbook은 spam 방어가 충분한 뒤 확장한다.

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
│   │   └── guestbook/
│   │       ├── guestbook.router.ts
│   │       ├── guestbook.service.ts
│   │       └── guestbook.types.ts
├── tests/
│   ├── reports.test.ts
│   ├── moderation.test.ts
│   └── guestbook.test.ts

frontend/
├── src/
│   ├── lib/
│   │   ├── reportsApi.ts
│   │   └── guestbookApi.ts
│   ├── hooks/
│   │   ├── useReportComment.ts
│   │   └── useGuestbook.ts
│   ├── components/
│   │   ├── safety/
│   │   │   ├── ReportDialog.tsx
│   │   │   ├── ModerationStatusBadge.tsx
│   │   │   └── CommunityGuidelinesLink.tsx
│   │   ├── guestbook/
│   │   │   ├── GuestbookEntryList.tsx
│   │   │   └── GuestbookEntryForm.tsx
│   │   └── admin/
│   │       ├── ModerationQueueTable.tsx
│   │       └── ReportReviewPanel.tsx
│   └── pages/
│       ├── GuestbookPage.tsx
│       ├── CommunityGuidelinesPage.tsx
│       ├── PrivacySafetyPage.tsx
│       └── admin/
│           ├── AdminModerationPage.tsx
│           └── AdminReportsPage.tsx

docs/
└── policies/
    ├── community-guidelines.md
    └── privacy-safety.md
```

---

## Route 설계

### Public/User

```text
/guestbook                       방명록 (조회 public, 작성 user+)
/community-guidelines            커뮤니티 가이드라인
/privacy-safety                  개인정보/안전 정책 요약
```

### Admin

```text
/admin/moderation                moderation queue
/admin/reports                   신고 목록/처리
```

---

## Task 1: Plan 8 결과 확인 및 Community Safety 라우트 준비

**Files:**
- Inspect/Modify: `frontend/src/App.tsx` 또는 `frontend/src/router.tsx`
- Inspect/Modify: `frontend/src/components/layout/*`
- Inspect/Modify: `frontend/src/components/admin/AdminNav.tsx`
- Create: page placeholders

- [x] **Step 1: Plan 8 완료 상태 확인**

```bash
find frontend/src -maxdepth 4 -type f | sort
find backend/src/modules -maxdepth 2 -type f | sort
```

Expected:
- audit/analytics/operations 기능 존재
- admin shell/nav 존재
- production hardening 문서 존재

- [x] **Step 2: public/user routes 추가**

```text
/guestbook
/community-guidelines
/privacy-safety
```

- [x] **Step 3: admin routes 추가**

```text
/admin/moderation
/admin/reports
```

- [x] **Step 4: route guard 정책 확인**

- `/guestbook` 조회는 public, 작성은 user+
- admin routes는 admin 전용
- policy pages는 public

- [x] **Step 5: admin nav에 Moderation 메뉴 추가**

```text
Moderation → /admin/moderation
Reports    → /admin/reports
```

- [x] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [x] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "feat(community): prepare safety routes"
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

`(commentId, reporterUserId)` unique index 필수 — 중복 신고 방지.

- [ ] **Step 2: 댓글 신고 endpoint 구현**

```text
POST /api/comments/:id/reports  user+
```

Request:

```json
{
  "reason": "spam",
  "description": "같은 링크를 반복해서 올립니다."
}
```

- [ ] **Step 3: validation 규칙**

- reason: ENUM allowlist 기준
- description: optional, max 1000
- 동일 사용자의 동일 댓글 중복 신고는 409 `ALREADY_REPORTED`
- 신고 생성도 Plan 8 rate limiter 적용 (abuse 방지)

- [ ] **Step 4: 신고 상태 초기화**

신고 status는 `open`으로 시작하고 admin moderation queue에서 볼 수 있게 한다.

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
- reason select (ENUM 기반)
- description textarea (optional)
- community guidelines link

- [ ] **Step 3: comment action에 신고 버튼 추가**

- 로그인 user에게만 신고 버튼 표시
- 미로그인 사용자는 로그인 유도

- [ ] **Step 4: success/error UX**

- 성공: "신고가 접수되었습니다."
- 중복: "이미 신고한 댓글입니다."
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

Queue 포함 대상:
- 신고된 댓글
- 신고된 방명록
- spam guard에 걸린 항목 (Plan 8 spam protection 재사용)

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

- [ ] **Step 5: Plan 8 audit log 연결**

다음 action을 기록한다:

```text
report.resolve
comment.moderate
guestbook.moderate
```

- [ ] **Step 6: 테스트 작성**

```text
GET /api/admin/reports as user -> 403
GET /api/admin/reports as admin -> 200
PATCH report status as admin -> 200
PATCH comment moderation hidden -> 200
moderation action creates audit log
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
moderateGuestbook(id, payload)
```

- [ ] **Step 2: moderation queue table 구현**

컬럼:
- kind (comment/guestbook)
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

- [ ] **Step 5: loading/error/empty state**

신고가 없는 상태는 "현재 검토할 신고가 없습니다."로 표시한다.

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

초기 정책: `POST /api/guestbook` user+ 전용.

- [ ] **Step 2: public list endpoint 구현**

```text
GET /api/guestbook?page=&limit=
```

정책: `isHidden=true` 항목은 public 응답에서 완전 제외. 관리자 화면에서만 표시.

- [ ] **Step 3: create endpoint 구현**

```text
POST /api/guestbook  user+
```

Request:

```json
{
  "body": "응원 메시지 남기고 갑니다!"
}
```

Validation:
- body: 1~1000자
- URL 과다 포함 방지 (Plan 8 spam guard 패턴 재사용)
- 동일 body 짧은 시간 반복 방지

- [ ] **Step 4: guestbook report endpoint 구현**

```text
POST /api/guestbook/:id/reports  user+
```

- [ ] **Step 5: admin guestbook moderation 연결**

```text
PATCH /api/admin/guestbook/:id/moderation
```

hidden 처리 및 Plan 8 audit log 기록.

- [ ] **Step 6: 테스트 작성**

```text
GET /api/guestbook -> 200
POST /api/guestbook without token -> 401
POST /api/guestbook empty body -> 400
POST /api/guestbook as user -> 201
POST /api/guestbook/:id/reports duplicate -> 409 ALREADY_REPORTED
GET /api/guestbook excludes hidden entries
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
- entry form (user+ 전용)
- entry list
- pagination

- [ ] **Step 3: 미로그인 UX**

미로그인 사용자는 "로그인하고 방명록 남기기" CTA를 본다.

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

## Task 8: 커뮤니티 가이드라인/정책 페이지

**Files:**
- Create: `frontend/src/pages/CommunityGuidelinesPage.tsx`
- Create: `frontend/src/pages/PrivacySafetyPage.tsx`
- Modify: `frontend/src/components/layout/*`
- Optional Create: `docs/policies/community-guidelines.md`
- Optional Create: `docs/policies/privacy-safety.md`

- [ ] **Step 1: community guidelines 초안 작성**

포함:
- 환영하는 행동
- 금지 행동 (spam, 괴롭힘, 개인정보 노출, 부적절 콘텐츠)
- 신고 방법
- 운영자 조치 기준

- [ ] **Step 2: privacy/safety note 작성**

포함:
- 수집하는 정보 요약 (Plan 8 analytics 포함)
- 댓글/방명록 공개 범위
- 신고 처리 방식
- 문의/삭제 요청 방식

- [ ] **Step 3: public pages 구현**

디자인은 public profile/portfolio 톤을 유지하되 가독성을 우선한다.

- [ ] **Step 4: footer link 추가**

```text
Community Guidelines
Privacy & Safety
```

- [ ] **Step 5: 신고/방명록 UI 연결**

ReportDialog와 GuestbookPage에서 guidelines link를 제공한다.

- [ ] **Step 6: 확인**

```bash
cd frontend
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/CommunityGuidelinesPage.tsx frontend/src/pages/PrivacySafetyPage.tsx frontend/src/components/layout docs/policies
git commit -m "docs(safety): add community guidelines pages"
```

---

## Task 9: API Contract / README 문서 최종화

**Files:**
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-05-06-plan9-community-safety-growth-features.md`

- [ ] **Step 1: API contract 업데이트 확인**

반드시 포함:
- comment report endpoints
- admin reports/moderation endpoints
- guestbook endpoints
- 새 error code: `ALREADY_REPORTED`

- [ ] **Step 2: README 커뮤니티 Safety 섹션 추가**

포함:
- 방명록/신고/처리 흐름
- moderation 운영 주의사항

- [ ] **Step 3: Plan 9 체크박스 상태 반영**

구현 완료된 Task/Step은 `[x]`로 업데이트한다.

- [ ] **Step 4: 확인**

```bash
git diff --check
```

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/api/2026-05-06-backend-api-contract.md README.md docs/superpowers/plans/2026-05-06-plan9-community-safety-growth-features.md docs/policies
git commit -m "docs: finalize community safety plan 9"
```

---

## Task 10: 전체 회귀 검증

- [ ] **Step 1: 상태 확인**

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

- [ ] **Step 3: frontend build**

```bash
cd frontend
npm run build
npm run lint
```

Expected: PASS (스크립트 없으면 최종 보고에 명시)

- [ ] **Step 4: Docker smoke test**

```bash
docker compose up --build -d
curl http://localhost/api/health
```

- [ ] **Step 5: Public route smoke test**

```text
/guestbook              → 정상 렌더, hidden 항목 미노출
/community-guidelines
/privacy-safety
```

- [ ] **Step 6: Admin route smoke test**

```text
/admin/moderation   → 미로그인 redirect, admin 접근 가능
/admin/reports      → 미로그인 redirect, admin 접근 가능
```

- [ ] **Step 7: Abuse prevention smoke test**

```text
중복 신고 → 409 ALREADY_REPORTED
hidden comment/guestbook → public 미노출
rate limit 초과 → 429 RATE_LIMITED
moderation action → audit log 생성
```

- [ ] **Step 8: 최종 Commit**

```bash
git add .
git commit -m "chore: complete community safety and moderation"
```

---

## 완료 기준

- [ ] 댓글 신고 workflow가 user+로 동작하고 중복 신고를 막음
- [ ] `/admin/moderation`에서 신고/검토 queue를 처리할 수 있음
- [ ] 댓글/방명록 숨김/복원 moderation이 가능함
- [ ] moderation 행동이 Plan 8 audit log에 기록됨
- [ ] `/guestbook` public 방명록이 정책에 맞게 동작함
- [ ] community guidelines/privacy safety 페이지가 public하게 제공됨
- [ ] abuse prevention smoke test가 통과함
- [ ] API contract 문서가 Plan 9 변경사항을 반영함
- [ ] `cd backend && npm run build && npm test` PASS
- [ ] `cd frontend && npm run build` PASS
- [ ] Docker smoke test에서 `/api/health` 정상 응답

---

## Plan 9B로 넘길 내용

Plan 9 완료 후 다음 계획은 `Plan 9B: Growth & Discovery Features`로 진행한다.

Plan 9B 범위:
- 사용자 notification center
- 알림 preference 관리 (in-app / push / email)
- 이메일 알림/digest 기반 구현
- 고급 검색 (full-text search, Korean ngram parser 필수)
- 태그/컬렉션 기반 탐색 UX
- 관리자 broadcast notification (optional)
