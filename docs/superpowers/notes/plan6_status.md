# Plan 6 구현 현황 분석

## 전체 요약

Plan 6은 **상당 부분 구현 완료**. 단, 계획 대비 범위가 더 넓게 확장됨 (Plan 7 범위 일부 포함).

---

## Task별 구현 상태

| Task | 내용 | 상태 | 비고 |
|------|------|------|------|
| **T1** | 라우트 확장 준비 (nav/route/type) | ✅ 완료 | AdminNav.tsx 존재 |
| **T2** | Dashboard Aggregate API (backend) | ✅ 완료 | `admin.dashboard.test.ts` 존재 |
| **T3** | Dashboard UI (aggregate API 연동) | ✅ 완료 | `AdminDashboardPage.tsx` + `DashboardMetricGrid.tsx` |
| **T4** | 전체 댓글 목록/필터링 API (backend) | ✅ 완료 | `admin.comments.test.ts` 존재 |
| **T5** | 댓글 관리 화면 개선 (frontend) | ✅ 완료 | `AdminCommentsPage.tsx` (14KB) + `useAdminComments.ts` |
| **T6** | `/admin/layout` 홈 섹션 배치 편집 | ✅ 완료 | `AdminLayoutPage.tsx` (15KB) + `layout.test.ts` |
| **T7** | `/admin/schedule` 캘린더 CRUD | ✅ 완료 | `AdminSchedulePage.tsx` (23KB) + `schedule.test.ts` |
| **T8** | `/admin/settings` 미디어 타입 설정 | ✅ 완료 | `AdminSettingsPage.tsx` (12KB) + `admin.settings.test.ts` |
| **T9** | 푸시 알림 발송 UI | ✅ 완료 | `AdminPushPage.tsx` (14KB) + `push.test.ts` |
| **T10** | PWA Install UX | ⚠️ 부분 | `useRegisterSWCustom.ts` 존재, `PwaInstallBanner.tsx` **없음** |
| **T11** | Push Permission/Subscription UX | ⚠️ 부분 | `nativePush.ts` 존재, `PushPermissionBanner.tsx` **없음** |
| **T12** | API Contract / README 문서 최종화 | ❓ 미확인 | |
| **T13** | 전체 회귀 검증 | ❓ 미실행 | |

---

## Plan 6 범위 대비 파일 현황

### ✅ 계획에 있고 구현된 것

**Frontend Pages (admin/):**
- `AdminDashboardPage.tsx` ✅
- `AdminLayoutPage.tsx` ✅
- `AdminSchedulePage.tsx` ✅
- `AdminSettingsPage.tsx` ✅
- `AdminPushPage.tsx` ✅
- `AdminCommentsPage.tsx` ✅

**Frontend Components (admin/):**
- `DashboardMetricGrid.tsx` ✅
- `AdminNav.tsx` ✅ (nav 확장)

**Frontend Hooks:**
- `useAdminDashboard.ts` ✅
- `useAdminComments.ts` ✅
- `useSchedules.ts` ✅

**Backend Tests:**
- `admin.dashboard.test.ts` ✅
- `admin.comments.test.ts` ✅
- `layout.test.ts` ✅
- `schedule.test.ts` ✅
- `push.test.ts` ✅
- `admin.settings.test.ts` ✅

**Backend Modules:**
- `admin/`, `layout/`, `schedule/`, `push/` ✅ 모두 존재

### ❌ 계획에 있으나 없는 것 (PWA 관련)

**Frontend Components (pwa/):**
- `PwaInstallBanner.tsx` ❌ — `pwa/` 디렉토리 자체 없음
- `PushPermissionBanner.tsx` ❌
- `NotificationOptInCard.tsx` ❌

**Frontend Hooks:**
- `usePwaInstallPrompt.ts` ❌
- `usePushPermission.ts` ❌

**Frontend Lib:**
- `pwa.ts` ❌
- `pushApi.ts` ❌ → 대신 `nativePush.ts`로 구현됨 (이름 다름)

**Frontend Hooks:**
- `useAdminLayout.ts` ❌ — AdminLayoutPage에 인라인 구현 추정
- `useAdminSettings.ts` ❌ — AdminSettingsPage에 인라인 구현 추정
- `useAdminPush.ts` ❌ — AdminPushPage에 인라인 구현 추정

**Frontend Components (admin/):**
- `LayoutSectionEditor.tsx` ❌ — AdminLayoutPage 내 통합 추정
- `LayoutPostPicker.tsx` ❌
- `MediaTypeSettingsTable.tsx` ❌
- `PushComposer.tsx` ❌
- `ScheduleCalendar.tsx` ❌
- `ScheduleEventForm.tsx` ❌

### 🆕 계획에 없이 추가된 것 (확장)

Plan 6 범위를 초과해 추가 구현된 기능:
- `AdminAnalyticsPage.tsx` + `useAdminAnalytics.ts` (analytics)
- `AdminAuditLogsPage.tsx` + `AuditLogTable.tsx` (audit)
- `AdminModerationPage.tsx` + `ModerationQueueList.tsx` (moderation)
- `AdminNotificationsPage.tsx` (notifications)
- `AdminOperationsPage.tsx` + `operationsApi.ts` (ops/backup)
- `AdminProfilePage.tsx` + `ProfileEditorForm.tsx` (profile branding)
- `AdminPortfolioPage.tsx` + `PortfolioSectionEditor.tsx` (portfolio)
- `AdminShowcasePage.tsx` + `ShowcaseEditorForm.tsx` (showcase)
- `AdminSeoPage.tsx` + `SeoSettingsForm.tsx` (SEO/OG)
- `AdminReportsPage.tsx` + `ReportsTable.tsx` (reports)
- `collections/`, `tags/` 페이지 (content mgmt)
- `BackupRunsTable.tsx` (operations)
- `ContentTagSelector.tsx`, `LocaleTabs.tsx` (공통 UI)

→ **Plan 7 범위(Portfolio, SEO, Profile Branding 등)가 이미 상당 부분 구현됨**

---

## 미완성 항목 요약 (PWA 집중)

PWA Task 10, 11이 핵심 미완성:

```
frontend/src/
├── lib/
│   ├── pwa.ts                  ❌ 없음
│   └── pushApi.ts              ❌ (nativePush.ts로 대체?)
├── hooks/
│   ├── usePwaInstallPrompt.ts  ❌ 없음
│   └── usePushPermission.ts    ❌ 없음
└── components/
    └── pwa/                    ❌ 디렉토리 없음
        ├── PwaInstallBanner.tsx
        ├── PushPermissionBanner.tsx
        └── NotificationOptInCard.tsx
```

`useRegisterSWCustom.ts`는 SW 등록 로직만 있고, install prompt/push permission UX 컴포넌트는 미구현 상태.
