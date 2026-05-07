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

---

## 🛡️ 커뮤니티 안전 및 콘텐츠 모더레이션 시스템 (Community Safety & Moderation)

CrocHub은 플랫폼 내 소통 공간이 안전하고 신뢰할 수 있게 유지되도록 강력한 비즈니스 정책 가드와 어드민 제어 센터를 제공합니다.

### 1. 실시간 신고 및 안전 제어 엔진 (Protection & Spam Guard)
- **IP 단방향 해싱 감사 (HMAC SHA-256)**: 도배성 악성 트래픽 및 오뷰징 공격을 방어하기 위해 접속 IP 정보를 원본으로 저장하지 않습니다. 서버에 설정된 임의의 난수 솔트(Salt)와 실시간 결합하여 암호화된 토큰 형태로만 대조 분석을 진행함으로써 개인정보를 완벽히 침해하지 않는 고유 접속 도배 가드를 운영합니다.
- **스팸 링크 자동 차단 (Spam Guard)**: 댓글 및 공개 방명록 본문 내에 지나치게 많은 영리 목적의 외부 광고성 URL(2개 이상)이 포함되어 있을 경우, 글 작성이 API 레이어에서 자동으로 반려 및 사전 전면 차단됩니다.
- **작성 속도 쿨타임 및 중복 동일 본문 감지**: 동일 작성자가 5초 이내에 연속해서 글을 남기거나, 1분 이내에 완전히 중복된 메시지를 도배 및 어뷰징할 경우 API 가드에 의해 정교하게 사전 차단됩니다.

### 2. 가역적 패널티 및 투명한 모더레이션 큐 (Audit & Recovery Trails)
- **가역성 숨김 원칙 (Soft Blind)**: 위반 사례 접수 시 데이터베이스 상에서 원본 텍스트를 즉각적이고 일방적으로 영구 삭제하지 않습니다. `isHidden: true` 플래그 및 상세 제재 사유(`hiddenReason`)를 기록해 시스템에서 임시 블라인드 처리함으로써, 부당한 제재나 오판에 대해 언제든지 신속한 복구 및 이의제기 구제가 가능하도록 데이터를 투명하게 수집 및 보존합니다.
- **통합 관리자 모더레이션 큐 및 신고 리포트 대시보드**:
  - **신고 내역 통합 관리 (`/admin/reports`)**: 댓글, 방명록 전반에 걸친 신고 리스트와 사유를 한눈에 파악하고 접수 상태(`open`, `reviewing`, `resolved`, `rejected`)를 단계별로 천천히 업데이트합니다.
  - **실시간 모더레이션 그리드 (`/admin/moderation`)**: 검토 중인 게시물들에 대해 실시간 숨김 차단 및 원상태 안전 구제 제어를 지원하는 관리 가이드라인 카드 인터페이스가 탑재되어 있습니다.
  - **감사 추적 로그 (Audit Logs)**: 관리자의 모든 상태 판단 및 블라인드 조치 이력은 감사 로그(`Audit Log`) 테이블에 상세 사유와 행동 유형이 영구 기록되어 어드민 검사 추적성을 극대화합니다.