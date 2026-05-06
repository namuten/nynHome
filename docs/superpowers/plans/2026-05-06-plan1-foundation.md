# CrocHub — Plan 1: Foundation 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Docker 환경 구성, MySQL + Prisma 스키마 설정, Express 앱 기본 구조, 인증(Auth) 모듈 완성

**Architecture:** 모듈형 모놀리스. Express 앱은 독립 모듈(auth, posts, media 등)로 구성되며 각 모듈은 router/service/types 파일로 분리된다. Prisma가 MySQL과 통신하는 유일한 경로이며, JWT를 통해 stateless 인증을 구현한다.

**Tech Stack:** Node.js 20, TypeScript 5, Express 4, Prisma 5, MySQL 8, bcryptjs, jsonwebtoken, Jest, Supertest, Docker Compose

---

## 파일 구조 맵

```
nynHome/
├── backend/
│   ├── src/
│   │   ├── app.ts                          # Express 앱 설정 (라우터 마운트)
│   │   ├── server.ts                       # HTTP 서버 진입점
│   │   ├── lib/
│   │   │   └── prisma.ts                   # PrismaClient 싱글턴
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts          # JWT 검증 미들웨어 (requireAuth, requireAdmin)
│   │   │   └── error.middleware.ts         # 전역 에러 핸들러
│   │   └── modules/
│   │       └── auth/
│   │           ├── auth.types.ts           # DTO 타입 정의
│   │           ├── auth.service.ts         # register / login / getMe 비즈니스 로직
│   │           └── auth.router.ts          # POST /register, POST /login, GET /me, POST /logout
│   ├── prisma/
│   │   ├── schema.prisma                   # 전체 DB 스키마
│   │   └── seed.ts                         # admin 계정 + media_type_config 기본값 시드
│   ├── tests/
│   │   ├── auth.register.test.ts
│   │   ├── auth.login.test.ts
│   │   └── auth.middleware.test.ts
│   ├── .env.test                           # 테스트 전용 환경변수
│   ├── Dockerfile
│   ├── jest.config.ts
│   ├── package.json
│   └── tsconfig.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## Task 1: 프로젝트 폴더 구조 생성

**Files:**
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/lib/prisma.ts`
- Create: `backend/src/middleware/error.middleware.ts`
- Create: `backend/src/modules/auth/auth.types.ts`
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/jest.config.ts`

- [x] **Step 1: 폴더 생성**

```bash
mkdir -p backend/src/lib backend/src/middleware backend/src/modules/auth backend/prisma backend/tests nginx
```

- [x] **Step 2: backend/package.json 작성**

```json
{
  "name": "crochub-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --runInBand --forceExit",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.14.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.19.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.0",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "prisma": "^5.14.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [x] **Step 3: backend/tsconfig.json 작성**

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
  "include": ["src", "prisma"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [x] **Step 4: backend/jest.config.ts 작성**

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setup.ts'],
};

export default config;
```

- [x] **Step 5: backend/tests/setup.ts 작성** (환경변수 로드)

```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
```

- [x] **Step 6: backend/.env.test 작성**

```
DATABASE_URL=mysql://crochub:secret@localhost:3306/crochub_test
JWT_SECRET=test-jwt-secret-do-not-use-in-production
```

- [x] **Step 7: 의존성 설치**

```bash
cd backend && npm install
```

Expected: node_modules 폴더 생성, 에러 없음

---

## Task 2: Docker Compose + 환경변수 설정

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `nginx/nginx.conf`
- Create: `backend/Dockerfile`

- [x] **Step 1: .env.example 작성**

```env
# DB
MYSQL_ROOT_PASSWORD=rootsecret
MYSQL_DATABASE=crochub
MYSQL_USER=crochub
MYSQL_PASSWORD=secret

# API
DATABASE_URL=mysql://crochub:secret@db:3306/crochub
JWT_SECRET=change-this-to-a-random-64-char-string-in-production
PORT=3000

# Admin seed
ADMIN_EMAIL=admin@crochub.dev
ADMIN_PASSWORD=change-me-in-production

# Cloudflare R2 (Plan 2에서 설정)
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# VAPID (Plan 2에서 설정)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

- [x] **Step 2: .env 파일 생성 (.gitignore에 추가)**

```bash
cp .env.example .env
echo ".env" >> .gitignore
echo "backend/.env.test" >> .gitignore
```

- [x] **Step 3: docker-compose.yml 작성**

```yaml
version: '3.8'

services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 10

  api:
    build: ./backend
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api

volumes:
  mysql_data:
```

- [x] **Step 4: nginx/nginx.conf 작성**

```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

- [x] **Step 5: backend/Dockerfile 작성**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

- [x] **Step 6: Docker DB 컨테이너만 먼저 기동**

```bash
docker compose up db -d
```

Expected: db 컨테이너가 healthy 상태가 될 때까지 대기, 에러 없음

---

## Task 3: Prisma 스키마 설정 + 마이그레이션

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/lib/prisma.ts`

- [x] **Step 1: backend/prisma/schema.prisma 작성**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  nickname     String
  avatarUrl    String?
  role         Role     @default(user)
  createdAt    DateTime @default(now())

  comments      Comment[]
  pushSubs      PushSubscription[]

  @@map("users")
}

enum Role {
  admin
  user
}

model Post {
  id           Int      @id @default(autoincrement())
  title        String
  body         String   @db.Text
  category     Category
  thumbnailUrl String?
  isPublished  Boolean  @default(false)
  viewCount    Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  media    Media[]
  comments Comment[]

  @@map("posts")
}

enum Category {
  creative
  blog
  study
}

model Media {
  id           Int          @id @default(autoincrement())
  postId       Int?
  fileUrl      String
  mimeType     String
  fileCategory FileCategory
  fileName     String
  fileSize     BigInt
  duration     Int?
  width        Int?
  height       Int?
  createdAt    DateTime     @default(now())

  post Post? @relation(fields: [postId], references: [id], onDelete: SetNull)

  @@map("media")
}

enum FileCategory {
  image
  video
  audio
  document
  other
}

model MediaTypeConfig {
  id           Int     @id @default(autoincrement())
  mimeType     String  @unique
  fileCategory String
  maxSizeMb    Int
  isAllowed    Boolean @default(true)

  @@map("media_type_config")
}

model Comment {
  id        Int      @id @default(autoincrement())
  postId    Int
  userId    Int
  body      String   @db.Text
  reply     String?  @db.Text
  isHidden  Boolean  @default(false)
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("comments")
}

model Schedule {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  startAt     DateTime
  endAt       DateTime
  color       String   @default("#6844c7")
  createdAt   DateTime @default(now())

  @@map("schedules")
}

model ContentLayout {
  id         Int      @id @default(autoincrement())
  sectionKey String
  postIds    Json
  order      Int
  isVisible  Boolean  @default(true)
  updatedAt  DateTime @updatedAt

  @@map("content_layout")
}

model PushSubscription {
  id        Int      @id @default(autoincrement())
  userId    Int?
  endpoint  String   @db.Text
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("push_subscriptions")
}
```

- [x] **Step 2: backend/src/lib/prisma.ts 작성**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [x] **Step 3: 로컬 테스트 DB 생성 (Docker DB 사용)**

```bash
# docker db가 실행 중인 상태에서
cd backend
DATABASE_URL="mysql://crochub:secret@localhost:3306/crochub" npx prisma migrate dev --name init
```

Expected: `migrations/` 폴더 생성, 테이블 생성 완료 출력

- [x] **Step 4: 테스트용 DB 생성**

```bash
docker exec -i $(docker compose ps -q db) mysql -u root -prootsecret -e "CREATE DATABASE IF NOT EXISTS crochub_test;"
docker exec -i $(docker compose ps -q db) mysql -u root -prootsecret -e "GRANT ALL ON crochub_test.* TO 'crochub'@'%';"
DATABASE_URL="mysql://crochub:secret@localhost:3306/crochub_test" npx prisma migrate deploy
```

Expected: 에러 없음, crochub_test DB에 테이블 생성

- [x] **Step 5: Commit**

```bash
git add backend/prisma/ backend/src/lib/ backend/package.json backend/tsconfig.json backend/jest.config.ts backend/tests/setup.ts docker-compose.yml nginx/ .env.example .gitignore
git commit -m "chore: initialize project structure, docker, and prisma schema"
```

---

## Task 4: Express 앱 기본 구조 + 에러 미들웨어

**Files:**
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/middleware/error.middleware.ts`

- [x] **Step 1: backend/src/middleware/error.middleware.ts 작성**

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err.stack);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
}
```

- [x] **Step 2: backend/src/app.ts 작성**

```typescript
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorMiddleware);

export default app;
```

- [x] **Step 3: backend/src/server.ts 작성**

```typescript
import app from './app';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [x] **Step 4: 헬스체크 확인**

```bash
cd backend && npm run dev &
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok"}`

- [x] **Step 5: Commit**

```bash
git add backend/src/app.ts backend/src/server.ts backend/src/middleware/error.middleware.ts
git commit -m "chore: add express app skeleton with health check"
```

---

## Task 5: Auth 타입 + Register 엔드포인트 (TDD)

**Files:**
- Create: `backend/src/modules/auth/auth.types.ts`
- Create: `backend/src/modules/auth/auth.service.ts`
- Create: `backend/src/modules/auth/auth.router.ts`
- Create: `backend/tests/auth.register.test.ts`

- [x] **Step 1: 실패하는 테스트 작성 (backend/tests/auth.register.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('새 사용자를 등록한다', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123', nickname: '테스터' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.nickname).toBe('테스터');
    expect(res.body.role).toBe('user');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('이미 존재하는 이메일이면 409를 반환한다', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123', nickname: '테스터' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'other123', nickname: '다른사람' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('EMAIL_TAKEN');
  });
});
```

- [x] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/auth.register.test.ts
```

Expected: FAIL — `Cannot POST /api/auth/register`

- [x] **Step 3: backend/src/modules/auth/auth.types.ts 작성**

```typescript
export interface RegisterDto {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: number;
  role: 'admin' | 'user';
}
```

- [x] **Step 4: backend/src/modules/auth/auth.service.ts 작성 (register만)**

```typescript
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { RegisterDto } from './auth.types';

export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(dto.password, 12);
  return prisma.user.create({
    data: { email: dto.email, passwordHash, nickname: dto.nickname },
    select: { id: true, email: true, nickname: true, role: true, createdAt: true },
  });
}
```

- [x] **Step 5: backend/src/modules/auth/auth.router.ts 작성 (register만)**

```typescript
import { Router, Request, Response } from 'express';
import * as authService from './auth.service';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'EMAIL_TAKEN' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
```

- [x] **Step 6: app.ts에 auth 라우터 마운트**

`backend/src/app.ts`의 `/api/health` 줄 다음에 추가:

```typescript
import authRouter from './modules/auth/auth.router';
// ...
app.use('/api/auth', authRouter);
```

- [x] **Step 7: 테스트 재실행 — 통과 확인**

```bash
cd backend && npm test -- tests/auth.register.test.ts
```

Expected: PASS (2 tests)

- [x] **Step 8: Commit**

```bash
git add backend/src/modules/auth/ backend/tests/auth.register.test.ts backend/src/app.ts
git commit -m "feat(auth): add register endpoint"
```

---

## Task 6: Login + JWT 엔드포인트 (TDD)

**Files:**
- Modify: `backend/src/modules/auth/auth.service.ts`
- Modify: `backend/src/modules/auth/auth.router.ts`
- Create: `backend/tests/auth.login.test.ts`

- [x] **Step 1: 실패하는 테스트 작성 (backend/tests/auth.login.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com', password: 'password123', nickname: '테스터' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('올바른 자격증명으로 로그인하면 토큰과 사용자를 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('틀린 비밀번호면 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('존재하지 않는 이메일이면 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/auth/logout', () => {
  it('항상 200을 반환한다', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
  });
});
```

- [x] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/auth.login.test.ts
```

Expected: FAIL — `Cannot POST /api/auth/login`

- [x] **Step 3: auth.service.ts에 login 함수 추가**

기존 파일의 import에 jwt 추가, 파일 끝에 login 함수 추가:

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { RegisterDto, LoginDto, JwtPayload } from './auth.types';

export async function register(dto: RegisterDto) {
  const existing = await prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(dto.password, 12);
  return prisma.user.create({
    data: { email: dto.email, passwordHash, nickname: dto.nickname },
    select: { id: true, email: true, nickname: true, role: true, createdAt: true },
  });
}

export async function login(dto: LoginDto) {
  const user = await prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const payload: JwtPayload = { userId: user.id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });

  return {
    token,
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
  };
}
```

- [x] **Step 4: auth.router.ts에 login + logout 라우트 추가**

```typescript
import { Router, Request, Response } from 'express';
import * as authService from './auth.service';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'EMAIL_TAKEN' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/logout', (_req, res) => {
  // JWT는 stateless — 클라이언트가 토큰을 삭제하면 됨
  res.json({ message: 'LOGGED_OUT' });
});

export default router;
```

- [x] **Step 5: 테스트 재실행 — 통과 확인**

```bash
cd backend && npm test -- tests/auth.login.test.ts
```

Expected: PASS (4 tests)

- [x] **Step 6: Commit**

```bash
git add backend/src/modules/auth/ backend/tests/auth.login.test.ts
git commit -m "feat(auth): add login and logout endpoints"
```

---

## Task 7: JWT 인증 미들웨어 + GET /me (TDD)

**Files:**
- Create: `backend/src/middleware/auth.middleware.ts`
- Modify: `backend/src/modules/auth/auth.service.ts`
- Modify: `backend/src/modules/auth/auth.router.ts`
- Create: `backend/tests/auth.middleware.test.ts`

- [x] **Step 1: 실패하는 테스트 작성 (backend/tests/auth.middleware.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let token: string;

beforeAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'me@example.com', password: 'password123', nickname: '나' });
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'me@example.com', password: 'password123' });
  token = loginRes.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/auth/me', () => {
  it('유효한 토큰으로 현재 사용자 정보를 반환한다', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@example.com');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('토큰 없으면 401을 반환한다', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('UNAUTHORIZED');
  });

  it('잘못된 토큰이면 401을 반환한다', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });
});
```

- [x] **Step 2: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/auth.middleware.test.ts
```

Expected: FAIL — `Cannot GET /api/auth/me`

- [x] **Step 3: backend/src/middleware/auth.middleware.ts 작성**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  next();
}
```

- [x] **Step 4: auth.service.ts에 getMe 함수 추가**

파일 끝에 추가:

```typescript
export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, nickname: true, avatarUrl: true, role: true, createdAt: true },
  });
  if (!user) throw new Error('USER_NOT_FOUND');
  return user;
}
```

- [x] **Step 5: auth.router.ts에 GET /me 라우트 추가**

기존 라우터 파일에 requireAuth import 추가 후, logout 라우트 다음에 추가:

```typescript
import { requireAuth } from '../../middleware/auth.middleware';

// ... 기존 register, login, logout 라우트 유지 ...

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch {
    res.status(404).json({ error: 'USER_NOT_FOUND' });
  }
});
```

- [x] **Step 6: 테스트 재실행 — 통과 확인**

```bash
cd backend && npm test -- tests/auth.middleware.test.ts
```

Expected: PASS (3 tests)

- [x] **Step 7: 전체 테스트 통과 확인**

```bash
cd backend && npm test
```

Expected: PASS (9 tests total)

- [x] **Step 8: Commit**

```bash
git add backend/src/middleware/auth.middleware.ts backend/src/modules/auth/ backend/tests/auth.middleware.test.ts
git commit -m "feat(auth): add JWT auth middleware and GET /me endpoint"
```

---

## Task 8: Admin 시드 스크립트

**Files:**
- Create: `backend/prisma/seed.ts`

- [x] **Step 1: backend/prisma/seed.ts 작성**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@crochub.dev';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me-in-production';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, nickname: 'Admin', role: 'admin' },
  });

  const defaultTypes = [
    { mimeType: 'image/jpeg', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/png', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/webp', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/gif', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/avif', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'video/mp4', fileCategory: 'video', maxSizeMb: 500 },
    { mimeType: 'video/quicktime', fileCategory: 'video', maxSizeMb: 500 },
    { mimeType: 'video/webm', fileCategory: 'video', maxSizeMb: 500 },
    { mimeType: 'audio/mpeg', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'audio/wav', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'audio/flac', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'audio/ogg', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'application/pdf', fileCategory: 'document', maxSizeMb: 30 },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      fileCategory: 'document',
      maxSizeMb: 30,
    },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileCategory: 'document',
      maxSizeMb: 30,
    },
  ];

  for (const type of defaultTypes) {
    await prisma.mediaTypeConfig.upsert({
      where: { mimeType: type.mimeType },
      update: {},
      create: type,
    });
  }

  console.log('✅ Seed complete — admin:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [x] **Step 2: package.json에 seed 스크립트 prisma 설정 추가**

`package.json`의 최상위에 다음 추가 (scripts와 같은 레벨):

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [x] **Step 3: 시드 실행 확인**

```bash
cd backend
DATABASE_URL="mysql://crochub:secret@localhost:3306/crochub" ADMIN_EMAIL="admin@crochub.dev" ADMIN_PASSWORD="test1234" npm run db:seed
```

Expected: `✅ Seed complete — admin: admin@crochub.dev`

- [x] **Step 4: Commit**

```bash
git add backend/prisma/seed.ts backend/package.json
git commit -m "chore: add admin and media-type-config seed script"
```

---

## Task 9: Docker 전체 구동 확인

- [x] **Step 1: Docker 이미지 빌드 + 전체 서비스 기동**

```bash
docker compose up --build -d
```

Expected: 3개 컨테이너 (db, api, nginx) 모두 running 상태

- [x] **Step 2: DB 마이그레이션 (컨테이너 내부)**

```bash
docker compose exec api npx prisma migrate deploy
```

Expected: Migrations applied 출력

- [x] **Step 3: 시드 실행 (컨테이너 내부)**

```bash
docker compose exec api npm run db:seed
```

Expected: `✅ Seed complete`

- [x] **Step 4: 헬스체크 및 auth 엔드포인트 확인**

```bash
# nginx 통해서 접근 (포트 80)
curl http://localhost/api/health
# Expected: {"status":"ok"}

curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crochub.dev","password":"test1234"}'
# Expected: {"token":"...", "user":{...,"role":"admin"}}
```

- [x] **Step 5: 최종 Commit**

```bash
git add backend/Dockerfile docker-compose.yml
git commit -m "chore: verify docker compose full stack startup"
```

---

## 완료 기준

- [x] `npm test` — 9개 테스트 전부 PASS
- [x] `docker compose up` — db, api, nginx 3개 컨테이너 정상 기동
- [x] `GET http://localhost/api/health` → `{"status":"ok"}`
- [x] `POST /api/auth/register` → 201
- [x] `POST /api/auth/login` → 200 + JWT 토큰
- [x] `GET /api/auth/me` (토큰 있음) → 200
- [x] `GET /api/auth/me` (토큰 없음) → 401
- [x] Admin 시드 정상 실행
