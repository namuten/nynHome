# CrocHub 개인 홈페이지 — 설계 스펙

- **작성일:** 2026-05-06
- **대상:** 고등학교 1학년 여학생 개인 홈페이지 + 모바일 PWA
- **목적:** 디지털 콘텐츠 관리, 개인 브랜딩, 방문자 소통, 향후 이력서·진학 포트폴리오 활용

---

## 1. 프로젝트 개요

### 핵심 목표
- 운영자(사이트 주인)가 창작물, 일상 블로그, 학습 자료를 직접 업로드·관리
- 방문자는 콘텐츠를 자유롭게 열람하고, 로그인 후 댓글로 소통
- 모바일 PWA로 푸시 알림을 통해 소통 강화
- 장기 자기 관리 플랫폼으로 성장 가능한 구조 (이력서·포트폴리오 확장 예정)

### AI 역할 분담
| AI | 담당 |
|----|------|
| Claude | 기획, 아키텍처 설계, 문서 작성 |
| Gemini | 코딩 구현, 디자인 컴포넌트 개발 |
| Codex | 보안 검토, 테스트, 버그 수정 |

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | React (Vite) + Tailwind CSS + PWA (Workbox) |
| Backend | Node.js + Express (모듈형 구조) |
| ORM | Prisma |
| Database | MySQL 8 |
| 미디어 스토리지 | Cloudflare R2 (S3 호환) |
| 인프라 | Docker + docker-compose |
| CI/CD | GitHub Actions → 서버 자동 배포 |
| 인증 | JWT (email + password) |
| 푸시 알림 | Web Push API + VAPID |

---

## 3. 시스템 아키텍처

```
Browser / PWA (React)
        │ HTTPS / REST API
Node.js + Express (모듈형 모놀리스)
  ├── auth      JWT 인증·인가
  ├── posts     게시물 CRUD
  ├── media     파일 업로드 (R2 연동)
  ├── comments  댓글·답변
  ├── schedule  개인 일정
  ├── layout    홈 화면 배치
  └── push      PWA 푸시 알림
        │
  ┌─────┴──────────────────────┐
MySQL (메타데이터)     Cloudflare R2 (파일)
```

### Docker Compose 서비스
| 서비스 | 이미지 | 역할 |
|--------|--------|------|
| `nginx` | nginx:alpine | 리버스 프록시 + React 정적 서빙 |
| `api` | node:20-alpine | Express API (포트 3000) |
| `db` | mysql:8 | 데이터베이스 (내부 전용) |

---

## 4. 데이터 모델

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| nickname | VARCHAR | |
| avatar_url | VARCHAR | |
| role | ENUM('admin','user') | admin은 시드로 1명 생성 |
| created_at | DATETIME | |

### posts
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| title | VARCHAR | |
| body | TEXT | 마크다운 또는 HTML |
| category | ENUM('creative','blog','study') | |
| thumbnail_url | VARCHAR | |
| is_published | BOOLEAN | |
| view_count | INT | |
| created_at / updated_at | DATETIME | |

### media
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| post_id | INT FK (nullable) | 단독 업로드 가능 |
| file_url | VARCHAR | Cloudflare R2 URL |
| mime_type | VARCHAR | 실제 MIME 타입 저장 |
| file_category | ENUM('image','video','audio','document','other') | UI 분류용 |
| file_name | VARCHAR | 원본 파일명 |
| file_size | BIGINT | bytes |
| duration | INT (nullable) | 영상·음악 길이(초) |
| width / height | INT (nullable) | 이미지·영상 해상도 |
| created_at | DATETIME | |

### media_type_config
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| mime_type | VARCHAR UNIQUE | 허용 MIME 타입 |
| file_category | VARCHAR | 분류 |
| max_size_mb | INT | 최대 파일 크기 |
| is_allowed | BOOLEAN | 관리자가 온/오프 |

**기본 허용 타입:**

| 카테고리 | MIME 타입 | 최대 크기 |
|----------|-----------|-----------|
| image | image/jpeg, image/png, image/webp, image/gif, image/avif | 20MB |
| video | video/mp4, video/mov, video/webm | 500MB |
| audio | audio/mpeg, audio/wav, audio/flac, audio/ogg | 50MB |
| document | application/pdf, .pptx, .docx | 30MB |
| other | 기타 | 50MB |

### comments
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| post_id | INT FK | |
| user_id | INT FK | |
| body | TEXT | 방문자 댓글 |
| reply | TEXT (nullable) | 관리자 답변 |
| is_hidden | BOOLEAN | 스팸 처리 |
| created_at | DATETIME | |

### schedules
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| title | VARCHAR | |
| description | TEXT (nullable) | |
| start_at / end_at | DATETIME | |
| color | VARCHAR | 캘린더 표시 색상 |
| created_at | DATETIME | |

### content_layout
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| section_key | VARCHAR | 'hero', 'featured', 'latest' 등 |
| post_ids | JSON | 배치된 게시물 ID 배열 |
| order | INT | 섹션 순서 |
| is_visible | BOOLEAN | |
| updated_at | DATETIME | |

### push_subscriptions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| user_id | INT FK (nullable) | 비로그인 구독도 허용 |
| endpoint | TEXT | |
| p256dh | TEXT | |
| auth | TEXT | |
| created_at | DATETIME | |

---

## 5. 화면 구성

### 공개 페이지 (비로그인 열람 가능)
| 경로 | 설명 |
|------|------|
| `/` | 홈 — 피처드 콘텐츠 + 최신 게시물 |
| `/gallery` | 창작물 갤러리 |
| `/blog` | 일상 블로그 |
| `/study` | 학습 자료 |
| `/post/:id` | 게시물 상세 (댓글은 로그인 필요) |
| `/profile` | 프로필 · 소개 페이지 |

### 인증
| 경로 | 설명 |
|------|------|
| `/login` | 로그인 |
| `/register` | 회원가입 |

### 관리자 (`/admin`, role=admin 전용)
| 경로 | 설명 |
|------|------|
| `/admin` | 대시보드 (통계 · 최근 활동) |
| `/admin/content` | 게시물 목록 · 관리 |
| `/admin/content/new` | 새 게시물 작성 |
| `/admin/content/:id/edit` | 게시물 수정 |
| `/admin/media` | 미디어 라이브러리 |
| `/admin/layout` | 홈 화면 섹션 배치 편집 |
| `/admin/comments` | 댓글 관리 · 답변 |
| `/admin/schedule` | 개인 일정 캘린더 |
| `/admin/users` | 방문자 목록 · 권한 관리 |
| `/admin/settings` | 미디어 타입 설정 · 푸시 알림 |

---

## 6. API 설계

### 인증
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### 게시물
```
GET    /api/posts              ?category=&page=  (공개)
GET    /api/posts/:id                            (공개)
POST   /api/posts                                🔒 admin
PUT    /api/posts/:id                            🔒 admin
DELETE /api/posts/:id                            🔒 admin
```

### 미디어
```
POST   /api/media/upload       🔒 admin  (R2 업로드)
GET    /api/media              🔒 admin
DELETE /api/media/:id          🔒 admin
```

### 댓글
```
GET    /api/posts/:id/comments                   (공개)
POST   /api/posts/:id/comments 🔒 user+
PUT    /api/comments/:id/reply 🔒 admin
DELETE /api/comments/:id       🔒 admin
```

### 일정
```
GET    /api/schedules          🔒 admin
POST   /api/schedules          🔒 admin
PUT    /api/schedules/:id      🔒 admin
DELETE /api/schedules/:id      🔒 admin
```

### 레이아웃
```
GET    /api/layout                               (공개)
PUT    /api/layout             🔒 admin
```

### 푸시
```
POST   /api/push/subscribe     🔒 user+
POST   /api/push/send          🔒 admin
```

### 설정
```
GET    /api/admin/media-types  🔒 admin
PUT    /api/admin/media-types/:id 🔒 admin
```

---

## 7. 프로젝트 디렉토리 구조

```
nynHome/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── public/
│   │   └── manifest.json        (PWA)
│   ├── Dockerfile
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── media/
│   │   │   ├── comments/
│   │   │   ├── schedule/
│   │   │   ├── layout/
│   │   │   └── push/
│   │   ├── middleware/
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── design_sample/
├── docs/
│   └── superpowers/
│       └── specs/
└── CLAUDE.md
```

---

## 8. 배포 및 환경변수

### 배포 흐름
```
로컬 개발 (docker-compose.yml)
  → git push feature/* → PR → main 머지
  → GitHub Actions (lint, prisma validate)
  → 서버: docker compose pull && docker compose up -d
```

### 환경변수 (.env, git 제외)
```
DATABASE_URL
JWT_SECRET
R2_ACCOUNT_ID
R2_ACCESS_KEY
R2_SECRET_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
```

---

## 9. 디자인 시스템

- 테마: **Vibrant Youthful Artistic**
- 주 색상: 라벤더 퍼플 `#6844c7`, 핑크 `#8a4778`, 크로코다일 그린 `#006d36`
- 배경: 틴트 오프화이트 `#fbf8ff`
- 폰트: Spline Sans (헤드라인), Plus Jakarta Sans (본문)
- 스타일: 글래스모피즘 + 크로코다일 스케일 모티프
- 레퍼런스: `/design_sample/` 폴더

---

## 10. 미래 확장 계획

- 이력서 · 포트폴리오 자동 생성 페이지 (진학용)
- 음악 플레이어 컴포넌트 (오디오 파일 스트리밍)
- 갤러리 슬라이드쇼 모드
- 다국어 지원 (한국어 / 영어)
