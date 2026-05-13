# Plan 6 구현 현황 분석 (2026-05-13 기준)

## 전체 상태: 대부분 완료, 버그/중복 정리 필요

---

## Task별 구현 상태

| Task | 내용 | 상태 |
|------|------|------|
| T1 | 라우트/타입 확장 준비 | ✅ 완료 |
| T2 | Dashboard Aggregate API (backend) | ✅ 완료 |
| T3 | Dashboard UI (aggregate 연동) | ✅ 완료 |
| T4 | 전체 댓글 API (backend) | ✅ 완료 |
| T5 | 댓글 관리 화면 (frontend) | ✅ 완료 |
| T6 | `/admin/layout` 홈 섹션 배치 편집 | ✅ 완료 |
| T7 | `/admin/schedule` 캘린더 CRUD | ✅ 완료 |
| T8 | `/admin/settings` 미디어 타입 설정 | ✅ 완료 |
| T9 | 푸시 알림 발송 UI | ✅ 완료 |
| T10 | PWA Install UX | ✅ 파일 구현됨, 버그 있음 |
| T11 | Push Permission/Subscription UX | ✅ 파일 구현됨, 미연결 항목 있음 |
| T12 | API Contract 문서 최종화 | ❓ 미확인 |
| T13 | 전체 회귀 검증 | ❓ 미실행 |

---

## 수정 필요한 버그/문제

### 🔴 HIGH - `admin.router.ts` 엔드포인트 중복 등록

`backend/src/modules/admin/admin.router.ts` 내에서:
- `GET /media-types` → 12번 라인, 92번 라인 **중복**
- `PUT /media-types/:id` → 17번 라인, 105번 라인 **중복**

**수정**: 92~118번 라인 블록 제거 (12~25번 라인이 validation 미들웨어 포함 버전)

---

### 🔴 HIGH - VAPID 키 하드코딩

`frontend/src/components/common/PwaInstallBanner.tsx:5`
```ts
const VAPID_PUBLIC_KEY = 'BLe0W6yk3UMp5shvgU2-rGAGVk8jpSR3_qZGHraNTjozoRHPS0-S3SIGRpZ79RA35mnKs6V62UZHqiF23lJddho';
```

**수정**: `lib/pushApi.ts`의 `getVapidPublicKey()`로 대체
- `GET /api/push/vapid-public-key` 엔드포인트는 backend에 이미 존재함

---

### 🟡 MID - `PwaInstallBanner` 중복 구현

두 개의 `PwaInstallBanner`가 공존:
- `frontend/src/components/pwa/PwaInstallBanner.tsx` — 훅 기반, 깔끔, 78줄
- `frontend/src/components/common/PwaInstallBanner.tsx` — 올인원, 264줄, VAPID 하드코딩 포함

`AppShell.tsx`는 `pwa/` 버전을 사용 중:
```ts
import PwaInstallBanner from '../pwa/PwaInstallBanner';
import PushPermissionBanner from '../pwa/PushPermissionBanner';
```

**수정 방향 선택 필요**:
- Option A: `pwa/` 버전 유지, `common/` 버전 삭제
- Option B: `common/` 버전으로 통합 (더 풍부한 기능, VAPID만 수정)

---

### 🟡 MID - `push/send` 경로 이중화

- `push.router.ts`: `POST /api/push/send` (auth + admin 미들웨어 적용, validation 스키마 사용) ✅ 권장
- `admin.router.ts`: `POST /api/admin/push/send` ← 별도로 추가 존재
- `adminApi.ts`: `/push/send` 호출 → `push.router.ts` 경로 사용 중

**수정**: `admin.router.ts`의 `POST /admin/push/send` 블록 제거 (push.router.ts로 충분)

---

### 🟢 LOW - `NotificationOptInCard` 미마운트

`frontend/src/components/pwa/NotificationOptInCard.tsx` 파일은 존재하지만 어디에도 import/사용되지 않음.

Plan 6 명세 기준으로는 `/profile` 또는 post 상세 페이지 하단에 삽입 예정.

**수정**: profile 페이지 또는 post 상세 페이지에 삽입 결정 후 마운트

---

### 🟢 LOW - `usePushPermission.ts` 미연결

`frontend/src/hooks/usePushPermission.ts` 파일은 존재하지만 사용처 없음.
`PushPermissionBanner.tsx`가 이 훅을 사용하는지 확인 필요.

---

## 파일 위치 참조

| 파일 | 경로 |
|------|------|
| admin router | `backend/src/modules/admin/admin.router.ts` |
| push router | `backend/src/modules/push/push.router.ts` |
| pushApi (frontend) | `frontend/src/lib/pushApi.ts` |
| PwaInstallBanner (사용 중) | `frontend/src/components/pwa/PwaInstallBanner.tsx` |
| PwaInstallBanner (중복) | `frontend/src/components/common/PwaInstallBanner.tsx` |
| PushPermissionBanner | `frontend/src/components/pwa/PushPermissionBanner.tsx` |
| NotificationOptInCard | `frontend/src/components/pwa/NotificationOptInCard.tsx` |
| AppShell (마운트 포인트) | `frontend/src/components/layout/AppShell.tsx` |
| usePwaInstallPrompt | `frontend/src/hooks/usePwaInstallPrompt.ts` |
| usePushPermission | `frontend/src/hooks/usePushPermission.ts` |
