# CrocHub — Plan 3: Backend Stabilization + API Contract 정리 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1, Plan 2 완료 — Express/Prisma/MySQL 기반 백엔드 코어 모듈 구현 완료

**Goal:** Plan 2 구현물을 프론트엔드 연동 가능한 상태로 안정화한다. `build/test` 실행을 고정하고, API 경로/응답/검증 규칙을 정리하며, Gemini가 다음 Plan 4(Frontend Foundation)를 안전하게 시작할 수 있는 백엔드 계약을 확정한다.

**중요:** 이 계획은 기능을 크게 추가하는 단계가 아니다. 이미 구현된 backend core를 “실제로 빌드되고, 테스트 가능하고, 프론트에서 예측 가능하게 호출할 수 있는 API”로 다듬는 단계다.

**Architecture:** 기존 Plan 2 구조 유지. 각 모듈은 `types / service / router` 구조를 유지한다. Prisma는 DB 접근의 유일한 경로다. 라우터에서는 인증/권한/입력 검증/HTTP 응답을 담당하고, service는 비즈니스 로직과 DB 처리를 담당한다.

**Tech Stack:** Plan 2 스택 + `zod` (runtime DTO validation)

---

## 현재 구현 기준으로 확인된 정리 대상

Plan 2 문서와 실제 구현은 대부분 일치하지만, 다음 항목은 Plan 3에서 명확히 고쳐야 한다.

1. `npm run build` 실패
   - `backend/tsconfig.json`의 `rootDir`가 `./src`인데 `include`가 `["src", "prisma"]`라서 `prisma/seed.ts`가 root 밖 파일로 잡힌다.

2. 테스트 환경 불안정
   - `backend/tests/setup.ts`가 `.env.test`를 로드하지만 기존 프로세스 환경변수 `DATABASE_URL`을 override하지 않는다.
   - 로컬 shell에 `DATABASE_URL=mysql://...@db:3306/...`가 있으면 host에서 `npm test` 실행 시 DB host `db`를 찾다가 실패한다.

3. Schedule API 경로 불일치
   - 설계 스펙/Plan 2: `/api/schedules`
   - 실제 구현/테스트: `/api/schedule`
   - 프론트엔드 진입 전에 하나로 확정해야 한다.

4. 입력 검증 부족
   - 게시물, 댓글, 일정, 레이아웃, 푸시, 관리자 설정 요청 body가 거의 그대로 service/Prisma로 전달된다.
   - 잘못된 category/date/page/limit/postIds/push payload 등에 대해 400 응답을 표준화해야 한다.

5. 에러 응답 포맷 불균일
   - 현재 `{ error: 'CODE' }` 중심이지만 모듈별로 500 처리, 404 코드명, validation 실패 형식이 정리되어 있지 않다.

6. API 계약 문서 부재
   - Plan 4 프론트엔드 구현 전에 실제 backend 기준 API contract 문서가 필요하다.

---

## 파일 구조 맵

```
backend/
├── package.json                         # scripts 정리
├── tsconfig.json                        # build 대상 정리
├── tsconfig.seed.json                   # seed 전용 tsconfig (필요 시)
├── jest.config.ts                       # 테스트 환경 고정
├── tests/
│   ├── setup.ts                         # .env.test override
│   └── *.test.ts                        # API 계약 변경 반영
└── src/
    ├── app.ts                           # 최종 route mount 확인
    ├── lib/
    │   └── validation.ts                # zod 검증 helper
    └── modules/
        ├── posts/
        ├── media/
        ├── comments/
        ├── schedule/
        ├── layout/
        ├── push/
        └── admin/

docs/
└── superpowers/
    └── api/
        └── 2026-05-06-backend-api-contract.md
```

---

## Task 1: 빌드 설정 안정화

**Files:**
- Modify: `backend/tsconfig.json`
- Optional Create: `backend/tsconfig.seed.json`
- Modify: `backend/package.json`

- [x] **Step 1: 현재 실패 재현**

```bash
cd backend
npm run build
```

Expected before fix:

```text
error TS6059: File '.../backend/prisma/seed.ts' is not under 'rootDir' '.../backend/src'
```

- [x] **Step 2: backend/tsconfig.json에서 앱 빌드 범위 확정**

앱 빌드는 `src`만 대상으로 한다.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests", "prisma"]
}
```

- [x] **Step 3: seed 실행 방식 확인**

현재 seed는 `ts-node prisma/seed.ts`로 실행되므로 앱 `tsc` build에 포함할 필요가 없다.

```bash
cd backend
npm run db:seed
```

Expected: DB가 떠 있고 env가 맞으면 seed 성공. DB가 없으면 DB 연결 실패만 발생해야 하며 TypeScript compile 범위 에러는 없어야 한다.

- [x] **Step 4: 빌드 성공 확인**

```bash
cd backend
npm run build
```

Expected: PASS, `backend/dist` 생성

- [x] **Step 5: Commit**

```bash
git add backend/tsconfig.json backend/package.json
git commit -m "fix(build): stabilize backend TypeScript build scope"
```

---

## Task 2: 테스트 환경 고정

**Files:**
- Modify: `backend/tests/setup.ts`
- Optional Modify: `backend/package.json`

- [x] **Step 1: .env.test가 항상 우선되도록 수정**

`backend/tests/setup.ts`에서 기존 shell 환경변수보다 `.env.test`가 우선되도록 한다.

```typescript
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });
```

- [x] **Step 2: 테스트 DB 주소 명시**

`backend/.env.test` 기준:

```env
DATABASE_URL=mysql://crochub:secret@localhost:3306/crochub_test
JWT_SECRET=test-jwt-secret-do-not-use-in-production
```

주의:
- host에서 `npm test` 실행 시 DB host는 `localhost`가 맞다.
- Docker `api` 컨테이너 안에서 테스트할 경우 DB host는 `db`가 맞다.
- 둘 중 하나를 공식 개발 방식으로 정해야 한다.

- [x] **Step 3: 공식 테스트 실행 방식을 선택**

권장: host에서 테스트 실행

```bash
docker compose up -d db
cd backend
DATABASE_URL=mysql://crochub:secret@localhost:3306/crochub_test npx prisma migrate deploy
npm test
```

대안: 컨테이너 내부에서 테스트 실행

```bash
docker compose exec api sh -lc "DATABASE_URL=mysql://crochub:secret@db:3306/crochub_test npm test"
```

- [x] **Step 4: package script 추가 검토**

필요하면 `backend/package.json`에 명확한 테스트 스크립트를 추가한다.

```json
{
  "scripts": {
    "test": "jest --runInBand --forceExit",
    "test:local": "jest --runInBand --forceExit"
  }
}
```

환경변수는 `.env.test`에서 override하므로 script에 직접 박지 않는 것을 우선한다.

- [x] **Step 5: 전체 테스트 통과 확인**

```bash
cd backend
npm test
```

Expected: 모든 test suites PASS

- [x] **Step 6: Commit**

```bash
git add backend/tests/setup.ts backend/package.json
git commit -m "fix(test): make test env deterministic"
```

---

## Task 3: API 경로 계약 확정

**Files:**
- Modify: `backend/src/app.ts`
- Modify: `backend/tests/schedule.test.ts`
- Create: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: Schedule 경로를 복수형으로 확정**

설계 스펙과 Plan 2 기준에 맞춰 schedule API는 `/api/schedules`로 확정한다.

현재:

```typescript
app.use('/api/schedule', scheduleRouter);
```

변경:

```typescript
app.use('/api/schedules', scheduleRouter);
```

- [x] **Step 2: schedule 테스트 경로 수정**

`backend/tests/schedule.test.ts`의 모든 `/api/schedule`을 `/api/schedules`로 변경한다.

- [x] **Step 3: 공개/관리자 권한 정책 확정**

Plan 2 문서에는 `GET /api/schedules`가 admin 전용으로 적혀 있었지만 실제 구현은 공개 조회다.

Plan 3에서는 다음 정책으로 확정한다.

```text
GET    /api/schedules          public
POST   /api/schedules          admin
PUT    /api/schedules/:id      admin
DELETE /api/schedules/:id      admin
```

이유:
- 공개 홈페이지/PWA에서 일정 캘린더를 보여줄 수 있다.
- 생성/수정/삭제만 관리자 전용으로 제한한다.

- [x] **Step 4: API contract 문서 작성**

`docs/superpowers/api/2026-05-06-backend-api-contract.md`를 생성하고 실제 구현 기준 API를 정리한다.

반드시 포함:
- auth
- posts
- media
- comments
- schedules
- layout
- push
- admin
- 인증 필요 여부
- 주요 request body
- 주요 response shape
- error code 목록

- [x] **Step 5: 테스트 확인**

```bash
cd backend
npm test -- tests/schedule.test.ts
npm test
```

- [x] **Step 6: Commit**

```bash
git add backend/src/app.ts backend/tests/schedule.test.ts docs/superpowers/api/
git commit -m "fix(api): align schedule routes with API contract"
```

---

## Task 4: 공통 Validation Helper 추가

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/lib/validation.ts`

- [x] **Step 1: zod 설치**

```bash
cd backend
npm install zod
```

- [x] **Step 2: validate helper 작성**

`backend/src/lib/validation.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: result.error.flatten(),
      });
    }
    req.query = result.data as any;
    next();
  };
}
```

- [x] **Step 3: validation error 응답 표준 확정**

모든 validation 실패는 다음 형식을 사용한다.

```json
{
  "error": "VALIDATION_ERROR",
  "details": {}
}
```

- [x] **Step 4: 단위 확인**

```bash
cd backend
npm run build
```

- [x] **Step 5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/src/lib/validation.ts
git commit -m "feat(validation): add zod request validation helpers"
```

---

## Task 5: Posts 입력 검증 추가

**Files:**
- Modify: `backend/src/modules/posts/posts.types.ts`
- Modify: `backend/src/modules/posts/posts.router.ts`
- Modify: `backend/tests/posts.test.ts`

- [x] **Step 1: posts schema 정의**

`posts.router.ts` 또는 `posts.types.ts`에 zod schema를 둔다. 프로젝트가 커지기 전까지는 module 내부 파일에 두는 것을 우선한다.

검증 규칙:
- `title`: string, 1~120자
- `body`: string, 1자 이상
- `category`: `creative | blog | study`
- `thumbnailUrl`: optional string url
- `isPublished`: optional boolean
- `page`: optional positive integer string
- `limit`: optional positive integer string, 최대 50

- [x] **Step 2: POST /api/posts 검증 적용**

잘못된 category, 빈 title/body는 400을 반환한다.

- [x] **Step 3: PUT /api/posts/:id 검증 적용**

부분 수정은 허용하되, 들어온 필드는 같은 규칙으로 검증한다.

- [x] **Step 4: GET /api/posts query 검증 적용**

잘못된 category/page/limit은 400을 반환한다.

- [x] **Step 5: 테스트 추가**

`backend/tests/posts.test.ts`에 추가:

```text
POST /api/posts with invalid category -> 400 VALIDATION_ERROR
POST /api/posts with empty title -> 400 VALIDATION_ERROR
GET /api/posts?category=invalid -> 400 VALIDATION_ERROR
GET /api/posts?page=-1 -> 400 VALIDATION_ERROR
```

- [x] **Step 6: 확인**

```bash
cd backend
npm test -- tests/posts.test.ts
```

- [x] **Step 7: Commit**

```bash
git add backend/src/modules/posts/ backend/tests/posts.test.ts
git commit -m "feat(posts): validate post request payloads"
```

---

## Task 6: Comments 입력 검증 및 권한 테스트 보강

**Files:**
- Modify: `backend/src/modules/comments/comments.types.ts`
- Modify: `backend/src/modules/comments/comments.router.ts`
- Modify: `backend/tests/comments.test.ts`

- [x] **Step 1: 댓글 body 검증**

규칙:
- comment `body`: string, 1~2000자
- reply `reply`: string, 1~2000자
- `page`: optional positive integer
- `limit`: optional positive integer, 최대 100

- [x] **Step 2: POST /api/posts/:postId/comments 검증 적용**

빈 댓글은 400.

- [x] **Step 3: PUT /api/comments/:id/reply 검증 적용**

빈 답변은 400.

- [x] **Step 4: 권한 테스트 보강**

추가 테스트:

```text
다른 일반 사용자는 남의 댓글 삭제 시 403
빈 댓글 작성 시 400
빈 관리자 답변 작성 시 400
```

- [x] **Step 5: 확인**

```bash
cd backend
npm test -- tests/comments.test.ts
```

- [x] **Step 6: Commit**

```bash
git add backend/src/modules/comments/ backend/tests/comments.test.ts
git commit -m "feat(comments): validate comment payloads and permissions"
```

---

## Task 7: Media 업로드 검증 보강

**Files:**
- Modify: `backend/src/modules/media/media.router.ts`
- Modify: `backend/src/modules/media/media.service.ts`
- Modify: `backend/tests/media.test.ts`

- [x] **Step 1: postId 검증**

`postId`가 넘어오면:
- positive integer여야 한다.
- 존재하는 post인지 확인한다.
- 없으면 404 `POST_NOT_FOUND`를 반환한다.

- [x] **Step 2: multer file size error 처리**

현재 service에서 MIME config 기반 size를 검사하지만, multer 자체 limit 초과 에러도 413으로 표준화한다.

응답:

```json
{ "error": "FILE_TOO_LARGE" }
```

- [x] **Step 3: 파일 없음 테스트 추가**

```text
POST /api/media/upload without file -> 400 NO_FILE
POST /api/media/upload with invalid postId -> 400 VALIDATION_ERROR
POST /api/media/upload with non-existing postId -> 404 POST_NOT_FOUND
```

- [x] **Step 4: 확인**

```bash
cd backend
npm test -- tests/media.test.ts
```

- [x] **Step 5: Commit**

```bash
git add backend/src/modules/media/ backend/tests/media.test.ts
git commit -m "feat(media): harden media upload validation"
```

---

## Task 8: Schedule 입력 검증 보강

**Files:**
- Modify: `backend/src/modules/schedule/schedule.types.ts`
- Modify: `backend/src/modules/schedule/schedule.router.ts`
- Modify: `backend/src/modules/schedule/schedule.service.ts`
- Modify: `backend/tests/schedule.test.ts`

- [x] **Step 1: schedule schema 정의**

규칙:
- `title`: string, 1~120자
- `description`: optional string, 최대 5000자
- `startAt`: ISO datetime string
- `endAt`: ISO datetime string
- `color`: optional hex color, 기본값 `#6844c7`
- `endAt`은 `startAt`보다 늦어야 한다.
- `month` query는 `YYYY-MM` 형식이어야 한다.

- [x] **Step 2: create/update 검증 적용**

잘못된 날짜나 역전된 날짜 범위는 400.

- [x] **Step 3: service 기본값 정리**

`color`가 없으면 `#6844c7`을 사용한다.

- [x] **Step 4: 테스트 추가**

```text
POST /api/schedules with endAt before startAt -> 400
POST /api/schedules with invalid color -> 400
GET /api/schedules?month=bad -> 400
GET /api/schedules?month=2026-05 -> 200
```

- [x] **Step 5: 확인**

```bash
cd backend
npm test -- tests/schedule.test.ts
```

- [x] **Step 6: Commit**

```bash
git add backend/src/modules/schedule/ backend/tests/schedule.test.ts
git commit -m "feat(schedule): validate schedule dates and filters"
```

---

## Task 9: Layout 입력 검증 보강

**Files:**
- Modify: `backend/src/modules/layout/layout.types.ts`
- Modify: `backend/src/modules/layout/layout.router.ts`
- Modify: `backend/src/modules/layout/layout.service.ts`
- Modify: `backend/tests/layout.test.ts`

- [x] **Step 1: layout schema 정의**

규칙:
- request body는 array
- `sectionKey`: string, 1~50자
- `postIds`: number array, positive integer만 허용
- `order`: number를 받더라도 저장 시 배열 index 기준으로 재정렬
- `isVisible`: boolean
- 중복 `sectionKey`는 허용하지 않는다.
- 존재하지 않는 post id가 있으면 400 `INVALID_POST_IDS`를 반환한다.

- [x] **Step 2: updateLayout 트랜잭션 개선**

현재 `deleteMany()` 후 `$transaction(create...)` 구조는 중간 실패 시 레이아웃이 비는 위험이 있다.

권장:
- `$transaction(async tx => { deleteMany; createMany/create... })` 형태로 묶는다.

- [x] **Step 3: 테스트 추가**

```text
PUT /api/layout with non-array body -> 400
PUT /api/layout with duplicated sectionKey -> 400
PUT /api/layout with invalid postIds -> 400
```

- [x] **Step 4: 확인**

```bash
cd backend
npm test -- tests/layout.test.ts
```

- [x] **Step 5: Commit**

```bash
git add backend/src/modules/layout/ backend/tests/layout.test.ts
git commit -m "feat(layout): validate homepage layout updates"
```

---

## Task 10: Push 입력 검증 및 구독 정책 정리

**Files:**
- Modify: `backend/src/modules/push/push.types.ts`
- Modify: `backend/src/modules/push/push.router.ts`
- Modify: `backend/src/modules/push/push.service.ts`
- Modify: `backend/tests/push.test.ts`
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: push subscribe schema 정의**

규칙:
- `endpoint`: valid url
- `keys.p256dh`: string, 1자 이상
- `keys.auth`: string, 1자 이상

- [x] **Step 2: push send schema 정의**

규칙:
- `title`: string, 1~120자
- `body`: string, 1~500자
- `url`: optional string, 내부 경로(`/...`) 또는 full URL 중 하나로 정책 확정

권장:
- `url`은 내부 경로만 허용한다. 예: `/post/1`

- [x] **Step 3: 비로그인 구독 정책 결정**

설계 스펙에는 비로그인 구독도 허용 가능하다고 되어 있지만 Plan 2 구현은 `requireAuth`다.

Plan 3에서는 다음으로 확정한다.

```text
POST /api/push/subscribe     user+
POST /api/push/send          admin
```

이유:
- 초기 버전에서는 로그인 사용자에게만 푸시를 보내 권한/삭제/개인화 관리가 쉽다.
- 추후 guest subscription은 별도 Plan에서 확장한다.

- [x] **Step 4: 테스트 추가**

```text
POST /api/push/subscribe with invalid endpoint -> 400
POST /api/push/send with empty title -> 400
POST /api/push/send with external url if disallowed -> 400
```

- [x] **Step 5: 확인**

```bash
cd backend
npm test -- tests/push.test.ts
```

- [x] **Step 6: Commit**

```bash
git add backend/src/modules/push/ backend/tests/push.test.ts docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "feat(push): validate push subscription and payloads"
```

---

## Task 11: Admin 입력 검증 및 사용자 관리 정책 정리

**Files:**
- Modify: `backend/src/modules/admin/admin.types.ts`
- Modify: `backend/src/modules/admin/admin.router.ts`
- Modify: `backend/src/modules/admin/admin.service.ts`
- Modify: `backend/tests/admin.test.ts`

- [x] **Step 1: admin media-types update schema 정의**

규칙:
- `isAllowed`: optional boolean
- `maxSizeMb`: optional integer, 1~1000
- 적어도 하나의 필드는 있어야 한다.

- [x] **Step 2: users pagination 검증**

규칙:
- `page`: optional positive integer
- `limit`: optional positive integer, 최대 100

- [x] **Step 3: delete user 정책 확인**

현재 admin 삭제 방지는 유지한다.

추가 권장:
- 자기 자신 삭제 방지도 명시한다.
- 마지막 admin 삭제 방지는 미래 확장으로 문서화한다.

- [x] **Step 4: 테스트 추가**

```text
PUT /api/admin/media-types/:id with maxSizeMb=0 -> 400
PUT /api/admin/media-types/:id with empty body -> 400
GET /api/admin/users?page=-1 -> 400
DELETE /api/admin/users/:id for admin user -> 403 CANNOT_DELETE_ADMIN
```

- [x] **Step 5: 확인**

```bash
cd backend
npm test -- tests/admin.test.ts
```

- [x] **Step 6: Commit**

```bash
git add backend/src/modules/admin/ backend/tests/admin.test.ts
git commit -m "feat(admin): validate admin settings and user queries"
```

---

## Task 12: Error Response 표준화

**Files:**
- Modify: `backend/src/middleware/error.middleware.ts`
- Optional Create: `backend/src/lib/errors.ts`
- Modify: all routers as needed
- Modify: tests as needed
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`

- [x] **Step 1: express error handler middleware 추가**

기본 목록:

```text
UNAUTHORIZED
INVALID_TOKEN
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
POST_NOT_FOUND
EMAIL_TAKEN
INVALID_CREDENTIALS
UNSUPPORTED_MEDIA_TYPE
FILE_TOO_LARGE
NO_FILE
INVALID_POST_IDS
CANNOT_DELETE_ADMIN
INTERNAL_ERROR
```

- [x] **Step 2: 주요 에러 코드 규격화**

```json
{
  "error": "ERROR_CODE",
  "message": "optional human readable message",
  "details": {}
}
```

초기 구현에서는 `message`는 생략 가능하다. 프론트는 `error` code를 기준으로 분기한다.

- [x] **Step 3: 라우터별 500 catch 최소화**

가능하면 라우터의 중복 `try/catch`를 줄이고 공통 에러 처리로 넘긴다.

단, 이번 Plan에서는 큰 리팩토링보다 응답 일관성을 우선한다.

- [x] **Step 4: 테스트 전체 확인**

```bash
cd backend
npm test
```

- [x] **Step 5: Commit**

```bash
git add backend/src backend/tests docs/superpowers/api/2026-05-06-backend-api-contract.md
git commit -m "fix(api): standardize backend error responses"
```

---

## Task 13: API Contract 문서 최종화

**Files:**
- Modify: `docs/superpowers/api/2026-05-06-backend-api-contract.md`
- Optional Modify: `README.md`

- [x] **Step 1: 로컬 전체 빌드 및 테스트 통과 보강**

```bash
cd backend
npm test
```

- [x] **Step 2: Docker 환경 기동 및 Health Check**

```bash
docker compose up --build -d
docker compose ps
```

- [x] **Step 3: 실제 구현 기준 endpoint 표 작성**

````markdown
## Posts

### GET /api/posts
- Auth: public
- Query:
  - category?: creative | blog | study
  - page?: number
  - limit?: number
- Response 200:
  ```json
  {
    "data": [],
    "total": 0,
    "page": 1,
    "limit": 12
  }
  ```
````

- [x] **Step 4: 프론트엔드에서 필요한 타입 이름 추가**

예:

```text
User
AuthResponse
PostSummary
PostDetail
MediaItem
CommentItem
ScheduleItem
LayoutSection
PushSubscriptionRequest
AdminMediaType
AdminUser
```

- [x] **Step 5: 인증 헤더 규칙 작성**

```text
Authorization: Bearer <token>
```

- [x] **Step 6: Plan 4에서 사용할 API base URL 작성**

개발 환경:

```text
VITE_API_BASE_URL=http://localhost:3000/api
```

Docker/nginx 환경:

```text
VITE_API_BASE_URL=/api
```

- [x] **Step 7: Commit**

```bash
git add docs/superpowers/api/2026-05-06-backend-api-contract.md README.md
git commit -m "docs(api): document backend API contract for frontend"
```

---

## Task 14: Docker + Health Check 최종 확인

**Files:**
- Optional Modify: `docker-compose.yml`
- Optional Modify: `backend/Dockerfile`

- [ ] **Step 1: Docker stack 기동 확인**

```bash
docker compose up --build -d
docker compose ps
```

Expected:
- `db` healthy
- `api` up
- `nginx` up

- [ ] **Step 2: DB migration + seed 확인**

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run db:seed
```

- [ ] **Step 3: health endpoint 확인**

```bash
curl http://localhost/api/health
curl http://localhost:3000/api/health
```

Expected:

```json
{"status":"ok"}
```

- [ ] **Step 4: Docker compose warning 정리 검토**

`docker-compose.yml`의 `version: '3.8'`는 최신 Docker Compose에서 obsolete warning을 낸다. 경고 제거를 원하면 삭제한다.

```yaml
services:
  db:
    ...
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml backend/Dockerfile
git commit -m "chore(docker): verify backend stack health"
```

---

## Task 15: 전체 회귀 검증

- [ ] **Step 1: clean 상태 확인**

```bash
git status --short
```

Expected: 의도한 변경만 존재

- [ ] **Step 2: build**

```bash
cd backend
npm run build
```

Expected: PASS

- [ ] **Step 3: tests**

```bash
cd backend
npm test
```

Expected: PASS

- [ ] **Step 4: endpoint smoke test**

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/posts
curl http://localhost:3000/api/layout
curl http://localhost:3000/api/schedules
```

Expected:
- health 200
- posts 200
- layout 200
- schedules 200

- [ ] **Step 5: 최종 Commit**

```bash
git add .
git commit -m "chore: complete backend stabilization and API contract"
```

---

## 완료 기준

- [ ] `cd backend && npm run build` PASS
- [ ] `cd backend && npm test` PASS
- [ ] Schedule API가 `/api/schedules`로 통일됨
- [ ] 모든 create/update endpoint에 기본 validation 적용
- [ ] validation 실패가 `400 { error: 'VALIDATION_ERROR' }`로 표준화됨
- [ ] 공통 error code 목록이 API contract 문서에 정리됨
- [ ] `docs/superpowers/api/2026-05-06-backend-api-contract.md` 작성 완료
- [ ] Docker stack에서 `/api/health` 정상 응답
- [ ] Plan 4 frontend 구현자가 API contract만 보고 연동 가능한 상태

---

## Plan 4로 넘길 내용

Plan 3 완료 후 다음 계획은 `Plan 4: Frontend Foundation + Public Pages`로 진행한다.

Plan 4에서 다룰 예정:
- Vite + React + TypeScript frontend scaffold
- Tailwind CSS + 디자인 토큰 적용
- React Router 구성
- API client + auth token storage
- 공개 페이지: home, gallery, blog, study, post detail, profile
- 로그인/회원가입 화면
- 기본 PWA manifest/service worker 준비
