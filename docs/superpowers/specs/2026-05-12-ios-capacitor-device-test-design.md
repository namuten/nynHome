# CrocHub — iOS Capacitor 실기기 테스트 설계

- **작성일:** 2026-05-12
- **목적:** 이미 웹으로 확인된 CrocHub를 iPhone 실기기에서 Capacitor 앱으로 실행하고 동작을 검증한다
- **범위:** iOS 실기기 실행에 필요한 최소 변경 사항 + Xcode 빌드·실행 절차

---

## 1. 배경 및 문제

현재 `frontend/.env`의 `VITE_API_BASE_URL=http://localhost:3000/api`는 로컬 개발용이다.
Capacitor로 빌드한 앱을 iPhone에서 실행하면 `localhost`가 iPhone 자신을 가리켜 API 호출이 전부 실패한다.
배포 서버(`https://nynhome.duckdns.org`)는 이미 운영 중이므로 빌드 시 해당 URL을 바라보도록 설정만 추가하면 된다.

---

## 2. 현재 상태 (변경 없는 항목)

- `frontend/ios/` — `npx cap add ios` 완료, Xcode 프로젝트 존재
- `frontend/capacitor.config.ts` — `appId: com.crochub.app`, `webDir: dist` 설정 완료
- `frontend/package.json` — `@capacitor/core`, `@capacitor/ios` 등 패키지 설치 완료
- `backend/src/app.ts` — `app.use(cors())` 모든 origin 허용 → `capacitor://localhost` 별도 처리 불필요

---

## 3. 변경 사항

### 3-1. `frontend/.env.production` 생성 (신규)

```env
VITE_API_BASE_URL=https://nynhome.duckdns.org/api
```

`npm run build`는 `.env.production`을 자동으로 우선 적용한다.
로컬 개발(`npm run dev`)은 기존 `.env`(`localhost:3000`)를 그대로 사용하므로 개발 환경에 영향 없다.

### 3-2. `.gitignore` 확인

`frontend/.env.production`은 서버 URL만 포함하고 시크릿이 없으므로 커밋 대상이다.
단, 파일 내에 API 키나 시크릿이 추가되지 않도록 주의한다.

---

## 4. 빌드 및 실행 절차

```
[1] npm run build          → frontend/dist 생성 (.env.production 적용)
[2] npx cap sync ios       → dist 내용을 ios/ Xcode 프로젝트에 복사
[3] npx cap open ios       → Xcode 실행
[4] Xcode 서명 설정        → Team 선택 (Apple Developer 계정)
[5] iPhone USB 연결 + 신뢰 → 기기 선택
[6] ⌘R 실행               → iPhone에 앱 설치·실행
```

모든 명령은 `frontend/` 디렉토리에서 실행한다.

---

## 5. Xcode 서명 설정 상세

- `App` 타겟 선택 → **Signing & Capabilities** 탭
- **Automatically manage signing** 체크
- **Team**: Apple Developer 계정 선택
- **Bundle Identifier**: `com.crochub.app` (변경 불필요)
- 무료 Apple 계정도 실기기 테스트 가능 (7일 만료, 테스트 목적으로 충분)

---

## 6. 검증 항목

| 항목 | 확인 방법 |
|------|-----------|
| 앱 실행 | iPhone 홈 화면에서 CrocHub 앱 실행 |
| API 연결 | 홈 피드에 콘텐츠 로드 여부 |
| 로그인 | 관리자 계정으로 로그인 성공 여부 |
| 미디어 | 이미지/영상 정상 표시 여부 |
| 하단 내비게이션 | MobileNav 표시 및 탭 전환 |
| Safe area | iPhone notch/홈바 영역 침범 없음 |

---

## 7. 범위 외 (이번 작업에서 제외)

- `sw.ts` (Service Worker) 작성 — 별도 작업
- Android 실기기 테스트 — iOS 확인 후 진행
- App Store 배포 — 이후 단계
- 푸시 알림 네이티브 테스트 — APNs 인증서 필요, 별도 작업

---

## 8. 완료 기준

```
✓ iPhone에서 CrocHub 앱이 실행됨
✓ 홈 피드에 콘텐츠가 정상 로드됨
✓ 로그인이 동작함
✓ 하단 내비게이션이 표시되고 탭 전환이 됨
✓ Safe area 레이아웃 이상 없음
```
