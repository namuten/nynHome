# nynHome — CrocHub 프로젝트

## 프로젝트 개요

고등학교 1학년 여학생을 위한 개인 홈페이지 + 모바일 앱.
본인의 디지털 콘텐츠를 관리하고, 방문자와 소통하며, 개인 브랜딩 및 향후 이력서·진학 자료로 활용하는 플랫폼.

---

## AI 역할 분담

| AI | 담당 |
|----|------|
| **Claude** | 기획, 아키텍처 설계, 문서 작성, 스펙 |
| **Gemini** | 코딩 구현, 디자인 컴포넌트 개발 |
| **Codex** | 보안 검토, 테스트, 버그 수정 |

Claude는 코드를 직접 작성하지 않는다. 설계 문서, 스펙, 아키텍처 결정 기록(ADR)을 생성한다.

---

## 기술 스택

```
Frontend  : React (Vite)
Backend   : Node.js (Express)
Database  : MySQL
Infra     : Docker (docker-compose)
Mobile    : React Native (또는 PWA — 설계 단계에서 결정)
CI/CD     : GitHub Actions → 서버 자동 배포
```

모든 서비스는 Docker 컨테이너로 실행된다.

---

## 디자인 시스템

- 테마: **Vibrant Youthful Artistic** (라벤더 퍼플, 글래스모피즘, 크로코다일 스케일 모티프)
- 폰트: Spline Sans (헤드라인), Plus Jakarta Sans (본문)
- 디자인 샘플: `/design_sample/` 폴더 참조
  - `home_my_creative_world/` — 메인 홈
  - `admin_dashboard_crochub/` — 관리자 대시보드
  - `croc_archive_media_library/` — 미디어 라이브러리
  - `upload_creation_crochub/` — 콘텐츠 업로드
  - `vibrant_youthful_artistic/DESIGN.md` — 디자인 토큰 스펙

---

## 핵심 기능

### 사용자 (Web / App)
- 홈 피드: 최신 콘텐츠 (영상, 이미지, 글) 열람
- 프로필 페이지: 소개, 브랜딩, SNS 링크
- 댓글 · 방명록: 방문자와 소통
- 푸시 알림: 새 글·답변 알림 (모바일)

### 운영자 (관리자)
- 콘텐츠 관리: 영상, 이미지, 문서 등록·수정·삭제
- 콘텐츠 배치: 홈 화면 레이아웃 커스터마이징
- 일정 관리: 개인 스케줄 캘린더
- 사용자 관리: 방문자 권한·접근 제어
- 댓글 관리: 답변 작성, 스팸 처리

### 미래 확장
- 이력서 · 포트폴리오 자동 생성 (진학용)
- 음악/아트 작품 전시 기능

---

## 개발 워크플로우

```
로컬 개발 (Docker Compose)
  │
  ▼
Git 브랜치 (feature/* → main)
  │
  ▼
GitHub Actions CI (lint, test)
  │
  ▼
서버 자동 배포 (Docker pull & up)
```

### Git 규칙
- `main` 브랜치 직접 push 금지
- 브랜치: `feature/`, `fix/`, `chore/`
- 커밋 컨벤션: `feat(scope): description` 형식

---

## 문서 구조

```
docs/
  superpowers/
    specs/          # Claude가 생성하는 설계 스펙
    plans/          # Claude가 생성하는 구현 계획
  adr/              # 아키텍처 결정 기록
design_sample/      # Gemini/Claude용 UI 레퍼런스
```

---

## Claude 작업 원칙

- 코드를 직접 작성하거나 수정하지 않는다
- 구현 전 반드시 스펙 문서를 먼저 작성하고 사용자 승인을 받는다
- 스펙은 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` 형식으로 저장
- 민감 정보(API 키, 비밀번호, `.env`)는 절대 커밋하지 않는다

---

## Antigravity 모바일 빌드 및 배포 규칙

### 🤖 안드로이드 APK 빌드 수순
사용자가 **"APK 빌드해줘"** 혹은 **"apk 파일 만들어줘"** 라고 요청하면, 반드시 아래 3단계를 수행하여 컴파일하고 파일을 공급한다:
1. **내장 JDK 17 연동**: `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` 을 사용해 터미널 JVM 버전을 통일한다.
2. **그레이들 디버그 빌드 기동**: `frontend/android` 디렉토리로 진입하여 `./gradlew assembleDebug` 명령을 실행한다.
3. **공개용 서빙 디렉토리로 다이렉트 이적**: 컴파일이 통과되면, 빌드 결과물인 `app-debug.apk` 파일을 반드시 **`frontend/public/crochub-debug.apk`** 위치로 강제 복사(`cp`)하여 서빙 대기시킨다.

