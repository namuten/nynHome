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
- **Backend**: Express + Node.js + Prisma ORM + MySQL 8 + Vitest (69 유닛 테스트 전체 통과)
- **Deployment**: Docker Compose + Nginx Multi-stage Reverse Proxy Core