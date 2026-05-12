# iOS Capacitor 실기기 테스트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CrocHub 앱을 iPhone 실기기에서 실행하고 핵심 기능(피드, 로그인, 미디어, 내비게이션)이 정상 동작하는지 확인한다.

**Architecture:** 기존 React+Vite 웹 빌드를 Capacitor가 iOS WebView로 래핑한다. 빌드 시 `.env.production`을 통해 API URL을 배포 서버(`https://nynhome.duckdns.org/api`)로 고정하고, `npx cap sync ios`로 Xcode 프로젝트에 최신 빌드를 복사한 뒤 실기기에서 실행한다.

**Tech Stack:** React + Vite + TypeScript + Capacitor 8 + Xcode (iOS)

**전제 조건:**
- Mac에 Xcode 설치됨
- Apple Developer 계정 보유 (무료 계정으로 실기기 테스트 가능, 7일 만료)
- iPhone USB 케이블 준비
- 배포 서버 `https://nynhome.duckdns.org` 운영 중

---

## 파일 구조

| 동작 | 경로 | 설명 |
|------|------|------|
| **생성** | `frontend/.env.production` | 프로덕션 빌드용 API URL |
| **확인** | `frontend/capacitor.config.ts` | appId, webDir 설정 확인 |
| **확인** | `frontend/.gitignore` | Capacitor 빌드 아티팩트 제외 확인 |

---

## Task 1: `.env.production` 생성

**Files:**
- Create: `frontend/.env.production`

Capacitor 앱이 iPhone에서 실행될 때 `localhost:3000`이 아닌 배포 서버를 바라봐야 한다. Vite는 `npm run build` 시 `.env.production`을 `.env`보다 우선 적용한다.

- [ ] **Step 1: `.env.production` 파일 생성**

`frontend/.env.production` 내용:

```env
VITE_API_BASE_URL=https://nynhome.duckdns.org/api
```

- [ ] **Step 2: 기존 `.env` 파일이 영향받지 않는지 확인**

`frontend/.env` 파일을 열어 `VITE_API_BASE_URL=http://localhost:3000/api`가 그대로인지 확인한다. 변경하지 않는다. 로컬 개발(`npm run dev`)은 `.env`를 그대로 사용한다.

- [ ] **Step 3: `.env.production` 커밋**

이 파일은 시크릿이 없고 서버 URL만 포함하므로 커밋 대상이다.

```bash
git add frontend/.env.production
git commit -m "chore(capacitor): add .env.production for iOS build pointing to deployed server"
```

---

## Task 2: 프로덕션 웹 빌드

**Files:**
- Read: `frontend/vite.config.ts` — VitePWA `injectManifest` 전략 사용 중이나 `sw.ts`가 없어 빌드 경고 발생 가능. 에러로 중단되면 Task 2-A를 따른다.

- [ ] **Step 1: `frontend/` 디렉토리에서 빌드 실행**

```bash
cd frontend
npm run build
```

- [ ] **Step 2: 빌드 결과 확인**

```bash
ls dist/
```

예상 출력:
```
assets/    index.html    manifest.json    offline.html    ...
```

`dist/` 폴더가 생성되고 `index.html`이 있으면 성공이다.

- [ ] **Step 3: (빌드 에러 발생 시) vite-plugin-pwa sw.ts 경고 처리**

만약 빌드가 `sw.ts not found` 에러로 실패하면 `frontend/vite.config.ts`의 VitePWA 설정에서 `strategies`를 임시로 `generateSW`로 변경한다:

```typescript
// frontend/vite.config.ts
VitePWA({
  registerType: 'prompt',
  injectRegister: 'auto',
  strategies: 'generateSW',   // ← injectManifest 대신 임시 변경
  manifest: false,
  devOptions: { enabled: true }
})
```

이후 다시 `npm run build`를 실행한다. `sw.ts` 작성은 별도 작업이므로 지금은 임시 우회한다.

- [ ] **Step 4: 빌드 성공 커밋 (vite.config.ts 변경 시에만)**

```bash
git add frontend/vite.config.ts
git commit -m "chore(pwa): temporarily switch to generateSW until sw.ts is implemented"
```

---

## Task 3: Capacitor iOS 동기화

**Files:**
- Modify (자동): `frontend/ios/App/App/public/` — cap sync가 dist/ 내용을 복사

모든 명령은 `frontend/` 디렉토리에서 실행한다.

- [ ] **Step 1: Capacitor 동기화 실행**

```bash
cd frontend
npx cap sync ios
```

예상 출력 (마지막 줄):
```
✔ Updating iOS native dependencies with pod install - Done in Xs
✔ copy ios - Done in Xs
✔ update ios - Done in Xs
```

- [ ] **Step 2: 동기화 결과 확인**

```bash
ls ios/App/App/public/
```

`index.html`, `assets/` 등 빌드 파일이 복사되어 있으면 성공이다.

---

## Task 4: Xcode 서명 설정 및 실기기 연결

이 Task는 GUI 작업이다. 터미널 명령은 Xcode를 여는 것뿐이며, 나머지는 Xcode 내에서 진행한다.

- [ ] **Step 1: Xcode 열기**

```bash
cd frontend
npx cap open ios
```

Xcode가 자동으로 `ios/App/App.xcworkspace`를 연다.

- [ ] **Step 2: Xcode에서 서명 설정**

1. 왼쪽 프로젝트 탐색기에서 **App** 클릭 (파란 아이콘)
2. 상단 탭에서 **Signing & Capabilities** 선택
3. **Automatically manage signing** 체크박스 활성화
4. **Team** 드롭다운에서 Apple 계정 선택
   - 계정이 없으면: Xcode → Settings → Accounts → `+` → Apple ID 로그인
5. **Bundle Identifier**: `com.crochub.app` 확인 (변경하지 않음)

- [ ] **Step 3: iPhone 연결 및 신뢰 설정**

1. iPhone을 USB 케이블로 Mac에 연결
2. iPhone에서 **"이 컴퓨터를 신뢰하시겠습니까?"** 팝업 → **신뢰** 탭
3. Xcode 상단 디바이스 선택 드롭다운에서 연결된 iPhone 선택
   - 예: `iPhone (My iPhone)` 형태로 표시됨

- [ ] **Step 4: iPhone에서 개발자 신뢰 허용**

무료 Apple 계정 사용 시 iPhone에서 추가 신뢰 설정이 필요하다:

iPhone → **설정** → **일반** → **VPN 및 기기 관리** → 개발자 앱 인증서 → **[Apple 계정 이메일] 신뢰**

---

## Task 5: 앱 빌드 및 실행

- [ ] **Step 1: Xcode에서 빌드 및 실행**

Xcode 상단에서 iPhone이 선택된 상태에서 **▶ (Run)** 버튼 클릭 또는 `⌘R`

빌드 진행 상태가 Xcode 상단 표시줄에 표시된다. 첫 빌드는 2~5분 소요될 수 있다.

- [ ] **Step 2: 빌드 성공 확인**

Xcode 하단 상태바에 **"Build Succeeded"** 표시 및 iPhone에 CrocHub 앱이 자동 실행되면 성공이다.

- [ ] **Step 3: 빌드 실패 시 — Code Signing 에러 처리**

에러 메시지가 `"Provisioning profile" doesn't include...` 형태이면:

1. Xcode → **Product** 메뉴 → **Clean Build Folder** (`⌘⇧K`)
2. Bundle Identifier를 고유값으로 변경: `com.crochub.app.{본인이름}` (예: `com.crochub.app.nyn`)
3. 다시 `⌘R` 실행

---

## Task 6: 실기기 동작 검증

iPhone에서 CrocHub 앱이 실행된 상태에서 아래 항목을 순서대로 확인한다.

- [ ] **Step 1: 홈 피드 로드 확인**

앱 실행 직후 홈 화면에 콘텐츠(게시물, 이미지 등)가 로드되는지 확인한다.

**실패 시 진단:**
- 흰 화면 또는 "연결할 수 없음" → API URL 문제. Mac에서 아래 명령으로 확인:
  ```bash
  cat frontend/dist/assets/*.js | grep -o 'nynhome.duckdns.org' | head -3
  ```
  출력이 없으면 `.env.production`이 적용되지 않은 것. Task 1~3을 다시 실행한다.

- [ ] **Step 2: 로그인 동작 확인**

우측 상단 또는 프로필 탭 → 로그인 화면 → 관리자 계정으로 로그인 시도 → 성공 여부 확인

- [ ] **Step 3: 미디어(이미지/영상) 표시 확인**

이미지가 포함된 게시물 또는 갤러리 페이지 진입 → 이미지 정상 로드 확인

- [ ] **Step 4: 하단 내비게이션 확인**

화면 하단에 MobileNav(홈/탐색/포트폴리오/알림/프로필 탭)가 표시되는지 확인.
각 탭 탭해서 페이지 전환 확인.

- [ ] **Step 5: Safe area 확인**

iPhone 상단 노치/Dynamic Island 및 하단 홈 바 영역에 콘텐츠가 침범하지 않는지 확인.
MobileNav 하단이 홈 바와 겹치지 않아야 한다.

- [ ] **Step 6: 검증 결과 메모**

문제가 발견된 항목을 메모해둔다. 레이아웃 버그, 깨진 UI, 동작하지 않는 기능 등.

---

## 완료 기준

```
✓ iPhone에서 CrocHub 앱이 실행됨
✓ 홈 피드에 콘텐츠가 정상 로드됨 (API 연결 성공)
✓ 로그인이 동작함
✓ 하단 내비게이션이 표시되고 탭 전환이 됨
✓ Safe area 레이아웃 이상 없음
```

---

## 참고 — 다음 작업

이번 실행 후 발견된 버그는 별도 fix 작업으로 처리한다.
이후 순서:
1. 발견된 모바일 UI 버그 수정
2. Android 실기기 테스트 (동일 절차, Android Studio 사용)
3. `sw.ts` (Workbox Service Worker) 작성 → PWA 완성
