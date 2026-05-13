# Android Native Push (FCM) 구현 작업 지시서

## 목표
어드민 페이지(`/admin/push`)에서 푸시 발송 시 **Android 네이티브 앱(Capacitor)**에서 수신되도록 구현.

## 현재 상태

### 이미 구현된 것
- `frontend/src/lib/nativePush.ts` — Capacitor PushNotifications로 권한 요청 + 토큰 수신 로직 존재
- `frontend/src/components/layout/AppShell.tsx` — `registerNativePush()` 호출 중
- `backend/src/modules/push/push.router.ts` — Web Push (VAPID) send 엔드포인트 존재
- `backend/src/modules/push/push.service.ts` — `sendToAll()` 구현됨 (Web Push만)

### 없는 것
- `google-services.json` — Firebase 프로젝트 연동 없음
- `backend`: `POST /api/push/native-token` 엔드포인트 없음
- `backend`: APNs/FCM 토큰 DB 저장 테이블 없음
- `backend`: 어드민 발송 시 FCM 토큰으로 발송하는 로직 없음

## 작업 순서

### Step 1: Firebase 프로젝트 설정 (수동 작업, 개발자 직접)
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 프로젝트 생성 or 기존 프로젝트 선택
3. Android 앱 추가 → `com.crochub.app` 패키지명 등록
4. `google-services.json` 다운로드 → `frontend/android/app/google-services.json` 배치
5. Firebase Console → 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성 → JSON 저장
   - 또는 Cloud Messaging → Server Key 복사

### Step 2: Backend — FCM 토큰 저장 엔드포인트

**파일 수정**: `backend/prisma/schema.prisma`
```prisma
model NativeDevice {
  id         Int      @id @default(autoincrement())
  token      String   @unique
  platform   String   // "android" | "ios"
  userId     Int?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**파일 수정**: `backend/src/modules/push/push.router.ts`
```ts
POST /api/push/native-token   (requireAuth)
Body: { token: string, platform: "android" | "ios" }
```

**파일 수정**: `backend/src/modules/push/push.service.ts`
- `saveNativeToken(token, platform, userId)` 함수 추가
- DB upsert (token unique)

### Step 3: Backend — FCM 발송 로직

**패키지 추가**:
```bash
cd backend && npm install firebase-admin
```

**환경변수 추가** (`backend/.env`, `.env.example`):
```env
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_CLIENT_EMAIL=<from-service-account-json>
FIREBASE_PRIVATE_KEY=<from-service-account-json>
```

**파일 수정**: `backend/src/lib/firebase.ts` (신규 생성)
- `firebase-admin` 초기화

**파일 수정**: `backend/src/modules/push/push.service.ts`
- `sendToAll()` 에 FCM 발송 로직 추가
- Web Push(VAPID)와 FCM 동시 발송
- stale 토큰 자동 삭제 유지

### Step 4: Frontend — capacitor.config.ts push plugin 추가

```ts
plugins: {
  PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"],
  },
  // 기존 SplashScreen ...
}
```

### Step 5: Android build.gradle — google-services plugin 추가

`frontend/android/build.gradle`:
```gradle
dependencies {
  classpath 'com.google.gms:google-services:4.4.0'
}
```

`frontend/android/app/build.gradle` 하단:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Step 6: 검증

```bash
# backend 빌드 확인
cd backend && npm run build && npm test

# frontend sync
cd frontend && npx cap sync android
```

테스트:
1. Android 기기에서 앱 실행
2. 알림 권한 허용
3. Logcat에서 FCM 토큰 확인
4. `/admin/push`에서 발송
5. 기기에서 수신 확인

## 파일 위치 참조

| 파일 | 경로 |
|------|------|
| Capacitor config | `frontend/capacitor.config.ts` |
| Native push 등록 | `frontend/src/lib/nativePush.ts` |
| AppShell (호출 위치) | `frontend/src/components/layout/AppShell.tsx` |
| Push router | `backend/src/modules/push/push.router.ts` |
| Push service | `backend/src/modules/push/push.service.ts` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Android build.gradle | `frontend/android/app/build.gradle` |
| google-services.json 위치 | `frontend/android/app/google-services.json` |

## 주의사항
- `google-services.json`은 git에 커밋하지 않아야 함 (`.gitignore` 확인)
- Firebase private key는 반드시 환경변수로 관리 (`FIREBASE_PRIVATE_KEY`)
- `\n` 이스케이프 처리 주의: `.env`에서는 `"-----BEGIN PRIVATE KEY-----\n..."` 형태
- Web Push (VAPID) 기존 로직은 그대로 유지하고 FCM을 **추가**하는 방식으로 구현
