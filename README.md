# CrocHub (namuten/nynHome)

공학적인 정교함과 디자인 지향적 영감이 만나 탄생한 통합 창작 아카이브 스페이스 **CrocHub**입니다.  
본 프로젝트는 세 개의 고품격 콘텐츠 채널(**Creative, Blog, Study**)과 인터랙티브 캘린더, 그리고 탄탄한 JWT 세션 기반 사용자 관리를 제공합니다.

---

## 🚀 시작 가이드 (Development Setup)

### 1. 사전 요구사항 (Prerequisites)
- [Node.js](https://nodejs.org/) LTS (v20 이상 권장)
- [Docker](https://www.docker.com/) & Docker Compose

### 2. 백엔드 실행 방법 (Backend Setup)
백엔드 로컬 데이터베이스 구동 및 API 서버 개발 모드 기동:

```bash
# 1. 의존성 설치 및 데이터베이스 서비스 가동
docker compose up -d db

# 2. 백엔드 디렉토리로 이동하여 개발 서버 기동
cd backend
npm install
npm run dev
```

### 3. 프론트엔드 실행 방법 (Frontend Setup)
Vite 기반 초고속 개발 피드 서빙:

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 핵심 환경 변수 (Environment Variables)

### 💻 Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### ⚙️ Backend (`backend/.env`)
기본 설정 가이드는 [backend/.env.example](file:///Users/nagee/git/nynHome/backend/.env.example) 파일을 참고하십시오.

---

## 📌 주요 접속 주소 (Access URLs)

- **Frontend Dev Server**: [http://localhost:5173](http://localhost:5173)
- **Backend API Entry**: [http://localhost:3000/api](http://localhost:3000/api)
- **Nginx Reverse Proxy / Docker Stack Entry**: [http://localhost](http://localhost)

---

## 🛠️ 기술 스택 및 품질 관리 (Tech Stack & Quality)

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + @tanstack/react-query + React Router v6 + Lucide Icons + ESLint (100% Pass)
- **Backend**: Express + Node.js + Prisma ORM + MySQL 8 + Vitest (124 통합 테스트 전체 통과)
- **Deployment**: Docker Compose + Nginx Multi-stage Reverse Proxy Core

---

## 🌟 개인 브랜딩 & 포트폴리오 시스템 (Personal Branding & Showcase)

CrocHub은 개인 크리에이터 및 개발자의 아이덴티티와 포트폴리오를 전문적으로 쇼케이싱할 수 있도록 특화된 다국어 브랜딩 스택을 탑재하고 있습니다.

### 1. 주요 접근 경로 (Access Paths)
- **자기소개 프로필 (Profile)**: `/profile`
- **포트폴리오 대시보드 (Portfolio)**: `/portfolio`
- **경력 이력서 (Print-optimized Resume)**: `/portfolio/resume` (A4 규격 인쇄 최적화 css 적용)
- **작품 아카이브 (Creative Showcase)**: `/portfolio/showcase`

### 2. 관리자 제어 기능 (Admin Branding Console)
어드민 패널([http://localhost:5173/admin](http://localhost:5173/admin))의 **개인 브랜딩** 섹션에서 다음 사항들을 자유롭게 관리하고 편집할 수 있습니다.
- **프로필 설정 (`/admin/profile`)**: 자기소개 이름, 한 줄 소개, 소셜 미디어 링크, 핵심 기술 스택 레이블을 다국어(한국어, 영어) 탭 방식으로 동적 편집합니다.
- **포트폴리오 관리 (`/admin/portfolio`)**: 경력 이력, 수상 실적, 메인 포트폴리오의 각 섹션 이름 및 내용을 다국어 탭 편집 방식으로 인라인 순서 재정렬 처리합니다.
- **작품 쇼케이스 (`/admin/showcase`)**: 개발 프로젝트, 디자인 성과물 등을 콤마 단위 태그 파싱, 제목 기준 하이픈 정규식 자동 슬러그 생성 기능을 동원해 등록 및 수동 정렬합니다.
- **SEO & Open Graph 설정 (`/admin/seo`)**: `home`, `profile`, `portfolio`, `resume`, `showcase`, `blog` 등의 핵심 페이지별 검색 키워드(Keywords), 타이틀(Title), 설명(Description) 및 썸네일(OG Image)을 카카오톡, 디스코드, 트위터(X) 스타일의 **실시간 SNS 공유 프리뷰 카드**를 보며 다국어별로 정밀 튜닝합니다.

### 3. 미디어 및 오디오 가이드 지원 (Audio Walkthrough Specs)
- **지원 형식**: 오디오 재생 래퍼는 `.mp3`, `.wav`, `.flac`, `.ogg`를 모두 완벽 지원합니다.
- **특화 연출**: 작품 상세 페이지 진입 시 LP판 물리 회전 디스크 CSS 애니메이션 및 이퀄라이저 기둥 효과가 적용된 자체 커스텀 플레이어로 프리미엄 오디오 도슨트 가이드를 송출할 수 있습니다.