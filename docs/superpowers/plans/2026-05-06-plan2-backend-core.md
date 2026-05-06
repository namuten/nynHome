# CrocHub — Plan 2: Backend Core 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1 (Foundation) 완료 — Docker 기동, Prisma 마이그레이션, Auth 모듈 동작 중

**Goal:** Posts, Media(R2), Comments, Schedule, Layout, Push, Admin 모듈 완성 — 모든 API 엔드포인트 구현

**Architecture:** 각 모듈은 types / service / router 3파일로 구성. service는 Prisma만 통해 DB 접근. R2 업로드는 `src/lib/r2.ts`를 단일 진입점으로 추상화해 테스트에서 모킹 가능하게 유지.

**Tech Stack:** Plan 1 스택 + `@aws-sdk/client-s3` (R2), `multer` (파일 수신), `web-push` (VAPID 푸시), `uuid` (R2 키 생성)

---

## 파일 구조 맵

```
backend/
├── src/
│   ├── lib/
│   │   ├── r2.ts                        # R2(S3) 클라이언트 + 업로드/삭제 함수
│   │   └── webpush.ts                   # web-push VAPID 초기화
│   └── modules/
│       ├── posts/
│       │   ├── posts.types.ts
│       │   ├── posts.service.ts
│       │   └── posts.router.ts
│       ├── media/
│       │   ├── media.types.ts
│       │   ├── media.service.ts         # multer + R2 업로드 + DB 저장
│       │   └── media.router.ts
│       ├── comments/
│       │   ├── comments.types.ts
│       │   ├── comments.service.ts
│       │   └── comments.router.ts
│       ├── schedule/
│       │   ├── schedule.types.ts
│       │   ├── schedule.service.ts
│       │   └── schedule.router.ts
│       ├── layout/
│       │   ├── layout.types.ts
│       │   ├── layout.service.ts
│       │   └── layout.router.ts
│       ├── push/
│       │   ├── push.types.ts
│       │   ├── push.service.ts
│       │   └── push.router.ts
│       └── admin/
│           ├── admin.types.ts
│           ├── admin.service.ts         # 미디어 타입 설정 + 사용자 관리
│           └── admin.router.ts
├── tests/
│   ├── posts.test.ts
│   ├── media.test.ts
│   ├── comments.test.ts
│   ├── schedule.test.ts
│   ├── layout.test.ts
│   ├── push.test.ts
│   └── admin.test.ts
```

---

## Task 1: 의존성 추가 + 공통 라이브러리

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/lib/r2.ts`
- Create: `backend/src/lib/webpush.ts`

- [x] **Step 1: 새 패키지 설치**

```bash
cd backend
npm install @aws-sdk/client-s3 multer web-push uuid
npm install --save-dev @types/multer @types/web-push @types/uuid
```

Expected: 에러 없음

- [x] **Step 2: backend/src/lib/r2.ts 작성**

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function uploadToR2(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
): Promise<string> {
  const ext = originalName.split('.').pop() ?? 'bin';
  const key = `${uuidv4()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(fileUrl: string): Promise<void> {
  const key = fileUrl.replace(`${R2_PUBLIC_URL}/`, '');
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
```

- [x] **Step 3: backend/src/lib/webpush.ts 작성**

```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  `mailto:${process.env.ADMIN_EMAIL ?? 'admin@crochub.dev'}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export { webpush };
```

- [x] **Step 4: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/src/lib/r2.ts backend/src/lib/webpush.ts
git commit -m "chore: add r2, web-push dependencies and lib wrappers"
```

---

## Task 2: Posts 모듈 (TDD)

**Files:**
- Create: `backend/src/modules/posts/posts.types.ts`
- Create: `backend/src/modules/posts/posts.service.ts`
- Create: `backend/src/modules/posts/posts.router.ts`
- Create: `backend/tests/posts.test.ts`

- [x] **Step 1: backend/src/modules/posts/posts.types.ts 작성**

```typescript
export type PostCategory = 'creative' | 'blog' | 'study';

export interface CreatePostDto {
  title: string;
  body: string;
  category: PostCategory;
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export interface UpdatePostDto {
  title?: string;
  body?: string;
  category?: PostCategory;
  thumbnailUrl?: string;
  isPublished?: boolean;
}

export interface ListPostsQuery {
  category?: PostCategory;
  page?: number;
  limit?: number;
}
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/posts.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // admin 생성
  await request(app).post('/api/auth/register').send({
    email: 'admin@test.com', password: 'password123', nickname: 'Admin',
  });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'password123',
  });
  adminToken = adminLogin.body.token;

  // 일반 user 생성
  await request(app).post('/api/auth/register').send({
    email: 'user@test.com', password: 'password123', nickname: 'User',
  });
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@test.com', password: 'password123',
  });
  userToken = userLogin.body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('GET /api/posts', () => {
  it('게시물 목록을 반환한다 (공개)', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
  });

  it('category 필터가 동작한다', async () => {
    await request(app).post('/api/posts').set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '블로그 글', body: '내용', category: 'blog', isPublished: true });
    const res = await request(app).get('/api/posts?category=blog');
    expect(res.status).toBe(200);
    res.body.data.forEach((p: any) => expect(p.category).toBe('blog'));
  });
});

describe('POST /api/posts', () => {
  it('admin이 게시물을 생성한다', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '새 글', body: '본문 내용', category: 'creative', isPublished: true });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('새 글');
    expect(res.body.category).toBe('creative');
  });

  it('일반 user는 403을 받는다', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '글', body: '내용', category: 'blog' });
    expect(res.status).toBe(403);
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app).post('/api/posts')
      .send({ title: '글', body: '내용', category: 'blog' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/posts/:id', () => {
  it('게시물 상세를 반환하고 viewCount를 1 증가시킨다', async () => {
    const create = await request(app).post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '상세글', body: '내용', category: 'study', isPublished: true });
    const id = create.body.id;

    const res = await request(app).get(`/api/posts/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.viewCount).toBe(1);
  });

  it('존재하지 않는 id면 404를 반환한다', async () => {
    const res = await request(app).get('/api/posts/999999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/posts/:id', () => {
  it('admin이 게시물을 수정한다', async () => {
    const create = await request(app).post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '원본', body: '내용', category: 'blog' });
    const id = create.body.id;

    const res = await request(app).put(`/api/posts/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정됨' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('수정됨');
  });
});

describe('DELETE /api/posts/:id', () => {
  it('admin이 게시물을 삭제한다', async () => {
    const create = await request(app).post('/api/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '삭제할 글', body: '내용', category: 'blog' });
    const id = create.body.id;

    const res = await request(app).delete(`/api/posts/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/posts.test.ts
```

Expected: FAIL — `Cannot GET /api/posts`

- [x] **Step 4: backend/src/modules/posts/posts.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { CreatePostDto, UpdatePostDto, ListPostsQuery } from './posts.types';

export async function listPosts(query: ListPostsQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, query.limit ?? 12);
  const skip = (page - 1) * limit;

  const where = {
    isPublished: true,
    ...(query.category ? { category: query.category } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, thumbnailUrl: true, viewCount: true, createdAt: true },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getPost(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { media: true },
  });
  if (!post) throw new Error('NOT_FOUND');

  await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  return { ...post, viewCount: post.viewCount + 1 };
}

export async function createPost(dto: CreatePostDto) {
  return prisma.post.create({ data: dto });
}

export async function updatePost(id: number, dto: UpdatePostDto) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error('NOT_FOUND');
  return prisma.post.update({ where: { id }, data: dto });
}

export async function deletePost(id: number) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error('NOT_FOUND');
  await prisma.post.delete({ where: { id } });
}
```

- [x] **Step 5: backend/src/modules/posts/posts.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as postsService from './posts.service';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { category, page, limit } = req.query as Record<string, string>;
  const result = await postsService.listPosts({
    category: category as any,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });
  res.json(result);
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const post = await postsService.getPost(parseInt(req.params.id));
    res.json(post);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const post = await postsService.createPost(req.body);
  res.status(201).json(post);
});

router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const post = await postsService.updatePost(parseInt(req.params.id), req.body);
    res.json(post);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await postsService.deletePost(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
```

- [x] **Step 6: app.ts에 posts 라우터 마운트**

`backend/src/app.ts`의 auth 라우터 다음에 추가:

```typescript
import postsRouter from './modules/posts/posts.router';
// ...
app.use('/api/posts', postsRouter);
```

- [x] **Step 7: 테스트 재실행 — 통과 확인**

```bash
cd backend && npm test -- tests/posts.test.ts
```

Expected: PASS (8 tests)

- [x] **Step 8: Commit**

```bash
git add backend/src/modules/posts/ backend/tests/posts.test.ts backend/src/app.ts
git commit -m "feat(posts): add posts CRUD endpoints"
```

---

## Task 3: Media 모듈 — R2 업로드 (TDD)

**Files:**
- Create: `backend/src/modules/media/media.types.ts`
- Create: `backend/src/modules/media/media.service.ts`
- Create: `backend/src/modules/media/media.router.ts`
- Create: `backend/tests/media.test.ts`

- [x] **Step 1: backend/src/modules/media/media.types.ts 작성**

```typescript
export type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'other';

export interface UploadedFileInfo {
  fileUrl: string;
  mimeType: string;
  fileCategory: FileCategory;
  fileName: string;
  fileSize: number;
  postId?: number;
}
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/media.test.ts)**

```typescript
import request from 'supertest';
import path from 'path';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

// R2 업로드를 모킹하여 실제 네트워크 호출 없이 테스트
jest.mock('../src/lib/r2', () => ({
  uploadToR2: jest.fn().mockResolvedValue('https://test.r2.dev/fake-key.jpg'),
  deleteFromR2: jest.fn().mockResolvedValue(undefined),
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

let adminToken: string;

beforeAll(async () => {
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({
    email: 'admin@test.com', password: 'password123', nickname: 'Admin',
  });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  const login = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'password123',
  });
  adminToken = login.body.token;

  // 허용 MIME 타입 시드
  await prisma.mediaTypeConfig.upsert({
    where: { mimeType: 'image/jpeg' },
    update: {},
    create: { mimeType: 'image/jpeg', fileCategory: 'image', maxSizeMb: 20, isAllowed: true },
  });
});

afterAll(async () => { await prisma.$disconnect(); });

describe('POST /api/media/upload', () => {
  it('admin이 이미지를 업로드한다', async () => {
    const res = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('fake-image-data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.fileUrl).toBeDefined();
    expect(res.body.fileCategory).toBe('image');
    expect(res.body.mimeType).toBe('image/jpeg');
  });

  it('허용되지 않은 MIME 타입이면 415를 반환한다', async () => {
    const res = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('data'), {
        filename: 'test.exe',
        contentType: 'application/x-msdownload',
      });

    expect(res.status).toBe(415);
    expect(res.body.error).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app)
      .post('/api/media/upload')
      .attach('file', Buffer.from('data'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/media', () => {
  it('admin이 미디어 목록을 조회한다', async () => {
    const res = await request(app)
      .get('/api/media')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('DELETE /api/media/:id', () => {
  it('admin이 미디어를 삭제한다', async () => {
    const upload = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('data'), { filename: 'del.jpg', contentType: 'image/jpeg' });
    const id = upload.body.id;

    const res = await request(app)
      .delete(`/api/media/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/media.test.ts
```

Expected: FAIL — `Cannot POST /api/media/upload`

- [x] **Step 4: backend/src/modules/media/media.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { uploadToR2, deleteFromR2 } from '../../lib/r2';
import { FileCategory } from './media.types';

function resolveCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.includes('document') || mimeType.includes('presentation')) return 'document';
  return 'other';
}

export async function uploadMedia(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  fileSize: number,
  postId?: number,
) {
  const config = await prisma.mediaTypeConfig.findUnique({ where: { mimeType } });
  if (!config || !config.isAllowed) throw new Error('UNSUPPORTED_MEDIA_TYPE');
  if (fileSize > config.maxSizeMb * 1024 * 1024) throw new Error('FILE_TOO_LARGE');

  const fileUrl = await uploadToR2(buffer, mimeType, originalName);
  const fileCategory = resolveCategory(mimeType);

  return prisma.media.create({
    data: {
      fileUrl,
      mimeType,
      fileCategory,
      fileName: originalName,
      fileSize,
      postId: postId ?? null,
    },
  });
}

export async function listMedia(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.media.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.media.count(),
  ]);
  return { data, total, page, limit };
}

export async function deleteMedia(id: number) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error('NOT_FOUND');
  await deleteFromR2(media.fileUrl);
  await prisma.media.delete({ where: { id } });
}
```

- [x] **Step 5: backend/src/modules/media/media.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as mediaService from './media.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 600 * 1024 * 1024 } });

router.post(
  '/upload',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE' });
    try {
      const postId = req.body.postId ? parseInt(req.body.postId) : undefined;
      const media = await mediaService.uploadMedia(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
        req.file.size,
        postId,
      );
      res.status(201).json(media);
    } catch (err: any) {
      if (err.message === 'UNSUPPORTED_MEDIA_TYPE') return res.status(415).json({ error: 'UNSUPPORTED_MEDIA_TYPE' });
      if (err.message === 'FILE_TOO_LARGE') return res.status(413).json({ error: 'FILE_TOO_LARGE' });
      res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
  },
);

router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await mediaService.listMedia(
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20,
  );
  res.json(result);
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await mediaService.deleteMedia(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
```

- [x] **Step 6: app.ts에 media 라우터 마운트**

```typescript
import mediaRouter from './modules/media/media.router';
// ...
app.use('/api/media', mediaRouter);
```

- [x] **Step 7: 테스트 재실행 — 통과 확인**

```bash
cd backend && npm test -- tests/media.test.ts
```

Expected: PASS (5 tests)

- [x] **Step 8: Commit**

```bash
git add backend/src/modules/media/ backend/tests/media.test.ts backend/src/app.ts
git commit -m "feat(media): add R2 file upload, list, delete endpoints"
```

---

## Task 4: Comments 모듈 (TDD)

**Files:**
- Create: `backend/src/modules/comments/comments.types.ts`
- Create: `backend/src/modules/comments/comments.service.ts`
- Create: `backend/src/modules/comments/comments.router.ts`
- Create: `backend/tests/comments.test.ts`

- [x] **Step 1: backend/src/modules/comments/comments.types.ts 작성**

```typescript
export interface CreateCommentDto {
  body: string;
}

export interface ReplyCommentDto {
  reply: string;
}
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/comments.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;
let postId: number;

beforeAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;

  const post = await request(app).post('/api/posts')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: '게시물', body: '내용', category: 'blog', isPublished: true });
  postId = post.body.id;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('POST /api/posts/:id/comments', () => {
  it('로그인한 사용자가 댓글을 작성한다', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: '좋은 글이에요!' });
    expect(res.status).toBe(201);
    expect(res.body.body).toBe('좋은 글이에요!');
    expect(res.body.isHidden).toBe(false);
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .send({ body: '댓글' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/posts/:id/comments', () => {
  it('게시물의 댓글 목록을 반환한다 (공개)', async () => {
    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/comments/:id/reply', () => {
  it('admin이 댓글에 답변한다', async () => {
    const comment = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: '질문있어요' });
    const commentId = comment.body.id;

    const res = await request(app)
      .put(`/api/comments/${commentId}/reply`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reply: '답변드립니다!' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('답변드립니다!');
  });
});

describe('DELETE /api/comments/:id', () => {
  it('admin이 댓글을 숨김 처리한다', async () => {
    const comment = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ body: '스팸' });
    const commentId = comment.body.id;

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/comments.test.ts
```

Expected: FAIL

- [x] **Step 4: backend/src/modules/comments/comments.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { CreateCommentDto, ReplyCommentDto } from './comments.types';

export async function listComments(postId: number) {
  return prisma.comment.findMany({
    where: { postId, isHidden: false },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, nickname: true, avatarUrl: true } } },
  });
}

export async function createComment(postId: number, userId: number, dto: CreateCommentDto) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('POST_NOT_FOUND');
  return prisma.comment.create({ data: { postId, userId, body: dto.body } });
}

export async function replyComment(commentId: number, dto: ReplyCommentDto) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('NOT_FOUND');
  return prisma.comment.update({ where: { id: commentId }, data: { reply: dto.reply } });
}

export async function deleteComment(commentId: number) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('NOT_FOUND');
  await prisma.comment.update({ where: { id: commentId }, data: { isHidden: true } });
}
```

- [x] **Step 5: backend/src/modules/comments/comments.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as commentsService from './comments.service';

const postsRouter = Router({ mergeParams: true });
const commentsRouter = Router();

postsRouter.get('/', async (req: Request, res: Response) => {
  const comments = await commentsService.listComments(parseInt(req.params.id));
  res.json(comments);
});

postsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const comment = await commentsService.createComment(parseInt(req.params.id), req.user!.userId, req.body);
    res.status(201).json(comment);
  } catch (err: any) {
    if (err.message === 'POST_NOT_FOUND') return res.status(404).json({ error: 'POST_NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

commentsRouter.put('/:id/reply', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const comment = await commentsService.replyComment(parseInt(req.params.id), req.body);
    res.json(comment);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

commentsRouter.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await commentsService.deleteComment(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export { postsRouter as commentsOnPostsRouter, commentsRouter };
```

- [x] **Step 6: app.ts에 comments 라우터 마운트**

```typescript
import { commentsOnPostsRouter, commentsRouter } from './modules/comments/comments.router';
// posts 라우터 다음에 추가:
app.use('/api/posts/:id/comments', commentsOnPostsRouter);
app.use('/api/comments', commentsRouter);
```

- [x] **Step 7: 테스트 재실행 — 통과 확인**

```bash
cd backend && npm test -- tests/comments.test.ts
```

Expected: PASS (5 tests)

- [x] **Step 8: Commit**

```bash
git add backend/src/modules/comments/ backend/tests/comments.test.ts backend/src/app.ts
git commit -m "feat(comments): add comment create, list, reply, delete endpoints"
```

---

## Task 5: Schedule 모듈 (TDD)

**Files:**
- Create: `backend/src/modules/schedule/schedule.types.ts`
- Create: `backend/src/modules/schedule/schedule.service.ts`
- Create: `backend/src/modules/schedule/schedule.router.ts`
- Create: `backend/tests/schedule.test.ts`

- [ ] **Step 1: backend/src/modules/schedule/schedule.types.ts 작성**

```typescript
export interface CreateScheduleDto {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: string;
}

export interface UpdateScheduleDto {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  color?: string;
}
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/schedule.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await prisma.schedule.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

const scheduleDto = { title: '수능 준비', startAt: '2026-11-01T09:00:00Z', endAt: '2026-11-01T18:00:00Z', color: '#6844c7' };

describe('POST /api/schedules', () => {
  it('admin이 일정을 생성한다', async () => {
    const res = await request(app).post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`).send(scheduleDto);
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('수능 준비');
  });

  it('일반 user는 403을 받는다', async () => {
    const res = await request(app).post('/api/schedules')
      .set('Authorization', `Bearer ${userToken}`).send(scheduleDto);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/schedules', () => {
  it('admin이 일정 목록을 조회한다', async () => {
    const res = await request(app).get('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/schedules/:id', () => {
  it('admin이 일정을 수정한다', async () => {
    const create = await request(app).post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`).send(scheduleDto);
    const id = create.body.id;

    const res = await request(app).put(`/api/schedules/${id}`)
      .set('Authorization', `Bearer ${adminToken}`).send({ title: '변경된 일정' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('변경된 일정');
  });
});

describe('DELETE /api/schedules/:id', () => {
  it('admin이 일정을 삭제한다', async () => {
    const create = await request(app).post('/api/schedules')
      .set('Authorization', `Bearer ${adminToken}`).send(scheduleDto);
    const id = create.body.id;

    const res = await request(app).delete(`/api/schedules/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/schedule.test.ts
```

Expected: FAIL

- [x] **Step 4: backend/src/modules/schedule/schedule.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.types';

export async function listSchedules() {
  return prisma.schedule.findMany({ orderBy: { startAt: 'asc' } });
}

export async function createSchedule(dto: CreateScheduleDto) {
  return prisma.schedule.create({
    data: {
      title: dto.title,
      description: dto.description,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      color: dto.color ?? '#6844c7',
    },
  });
}

export async function updateSchedule(id: number, dto: UpdateScheduleDto) {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) throw new Error('NOT_FOUND');
  return prisma.schedule.update({
    where: { id },
    data: {
      ...dto,
      ...(dto.startAt ? { startAt: new Date(dto.startAt) } : {}),
      ...(dto.endAt ? { endAt: new Date(dto.endAt) } : {}),
    },
  });
}

export async function deleteSchedule(id: number) {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule) throw new Error('NOT_FOUND');
  await prisma.schedule.delete({ where: { id } });
}
```

- [x] **Step 5: backend/src/modules/schedule/schedule.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as scheduleService from './schedule.service';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (_req, res: Response) => {
  const schedules = await scheduleService.listSchedules();
  res.json(schedules);
});

router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const schedule = await scheduleService.createSchedule(req.body);
  res.status(201).json(schedule);
});

router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const schedule = await scheduleService.updateSchedule(parseInt(req.params.id), req.body);
    res.json(schedule);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await scheduleService.deleteSchedule(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
```

- [x] **Step 6: app.ts에 schedule 라우터 마운트**

```typescript
import scheduleRouter from './modules/schedule/schedule.router';
app.use('/api/schedules', scheduleRouter);
```

- [x] **Step 7: 테스트 통과 확인**

```bash
cd backend && npm test -- tests/schedule.test.ts
```

Expected: PASS (5 tests)

- [x] **Step 8: Commit**

```bash
git add backend/src/modules/schedule/ backend/tests/schedule.test.ts backend/src/app.ts
git commit -m "feat(schedule): add schedule CRUD endpoints"
```

---

## Task 6: Layout 모듈 (TDD)

**Files:**
- Create: `backend/src/modules/layout/layout.types.ts`
- Create: `backend/src/modules/layout/layout.service.ts`
- Create: `backend/src/modules/layout/layout.router.ts`
- Create: `backend/tests/layout.test.ts`

- [x] **Step 1: backend/src/modules/layout/layout.types.ts 작성**

```typescript
export interface LayoutSection {
  sectionKey: string;
  postIds: number[];
  order: number;
  isVisible: boolean;
}

export type UpdateLayoutDto = LayoutSection[];
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/layout.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;

beforeAll(async () => {
  await prisma.contentLayout.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('GET /api/layout', () => {
  it('레이아웃 설정을 공개적으로 반환한다', async () => {
    const res = await request(app).get('/api/layout');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/layout', () => {
  it('admin이 레이아웃 섹션을 저장한다', async () => {
    const sections = [
      { sectionKey: 'hero', postIds: [1, 2], order: 0, isVisible: true },
      { sectionKey: 'featured', postIds: [3], order: 1, isVisible: true },
    ];

    const res = await request(app)
      .put('/api/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sections);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].sectionKey).toBe('hero');
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app).put('/api/layout').send([]);
    expect(res.status).toBe(401);
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/layout.test.ts
```

Expected: FAIL

- [x] **Step 4: backend/src/modules/layout/layout.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { UpdateLayoutDto } from './layout.types';

export async function getLayout() {
  return prisma.contentLayout.findMany({ orderBy: { order: 'asc' } });
}

export async function updateLayout(sections: UpdateLayoutDto) {
  await prisma.contentLayout.deleteMany();
  return prisma.$transaction(
    sections.map((s, i) =>
      prisma.contentLayout.create({
        data: { sectionKey: s.sectionKey, postIds: s.postIds, order: i, isVisible: s.isVisible },
      }),
    ),
  );
}
```

- [x] **Step 5: backend/src/modules/layout/layout.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as layoutService from './layout.service';

const router = Router();

router.get('/', async (_req, res: Response) => {
  const layout = await layoutService.getLayout();
  res.json(layout);
});

router.put('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const layout = await layoutService.updateLayout(req.body);
  res.json(layout);
});

export default router;
```

- [x] **Step 6: app.ts에 layout 라우터 마운트**

```typescript
import layoutRouter from './modules/layout/layout.router';
app.use('/api/layout', layoutRouter);
```

- [x] **Step 7: 테스트 통과 확인 후 Commit**

```bash
cd backend && npm test -- tests/layout.test.ts
git add backend/src/modules/layout/ backend/tests/layout.test.ts backend/src/app.ts
git commit -m "feat(layout): add homepage layout get/update endpoints"
```

---

## Task 7: Push 모듈 (TDD)

**Files:**
- Create: `backend/src/modules/push/push.types.ts`
- Create: `backend/src/modules/push/push.service.ts`
- Create: `backend/src/modules/push/push.router.ts`
- Create: `backend/tests/push.test.ts`

- [x] **Step 1: backend/src/modules/push/push.types.ts 작성**

```typescript
export interface SubscribeDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SendPushDto {
  title: string;
  body: string;
  url?: string;
}
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/push.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

// web-push 모킹
jest.mock('../src/lib/webpush', () => ({
  webpush: {
    sendNotification: jest.fn().mockResolvedValue({ statusCode: 201 }),
  },
}));

let adminToken: string;
let userToken: string;

beforeAll(async () => {
  await prisma.pushSubscription.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;
});

afterAll(async () => { await prisma.$disconnect(); });

const subDto = { endpoint: 'https://fcm.example.com/sub123', keys: { p256dh: 'key123', auth: 'auth123' } };

describe('POST /api/push/subscribe', () => {
  it('로그인한 사용자가 푸시 구독을 등록한다', async () => {
    const res = await request(app)
      .post('/api/push/subscribe')
      .set('Authorization', `Bearer ${userToken}`)
      .send(subDto);
    expect(res.status).toBe(201);
    expect(res.body.endpoint).toBe(subDto.endpoint);
  });

  it('비로그인은 401을 받는다', async () => {
    const res = await request(app).post('/api/push/subscribe').send(subDto);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/push/send', () => {
  it('admin이 푸시를 전송한다', async () => {
    await request(app).post('/api/push/subscribe')
      .set('Authorization', `Bearer ${userToken}`).send(subDto);

    const res = await request(app)
      .post('/api/push/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '새 글', body: '확인하세요!', url: '/post/1' });
    expect(res.status).toBe(200);
    expect(res.body.sent).toBeGreaterThanOrEqual(1);
  });

  it('일반 user는 403을 받는다', async () => {
    const res = await request(app)
      .post('/api/push/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '글', body: '내용' });
    expect(res.status).toBe(403);
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/push.test.ts
```

Expected: FAIL

- [x] **Step 4: backend/src/modules/push/push.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { webpush } from '../../lib/webpush';
import { SubscribeDto, SendPushDto } from './push.types';

export async function subscribe(dto: SubscribeDto, userId?: number) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: dto.endpoint } as any,
    update: { p256dh: dto.keys.p256dh, auth: dto.keys.auth },
    create: {
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      userId: userId ?? null,
    },
  });
}

export async function sendToAll(dto: SendPushDto): Promise<number> {
  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({ title: dto.title, body: dto.body, url: dto.url ?? '/' });

  let sent = 0;
  const stale: number[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch {
        stale.push(sub.id);
      }
    }),
  );

  if (stale.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: stale } } });
  }

  return sent;
}
```

- [x] **Step 5: backend/src/modules/push/push.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as pushService from './push.service';

const router = Router();

router.post('/subscribe', requireAuth, async (req: Request, res: Response) => {
  const sub = await pushService.subscribe(req.body, req.user!.userId);
  res.status(201).json(sub);
});

router.post('/send', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const sent = await pushService.sendToAll(req.body);
  res.json({ sent });
});

export default router;
```

> **참고:** `prisma.pushSubscription.upsert`가 `endpoint` 필드를 unique로 인식하려면 Prisma schema에 `@@unique([endpoint])`를 추가해야 한다. 추가 방법:
> `backend/prisma/schema.prisma`의 `PushSubscription` 모델 끝에 `@@unique([endpoint])` 추가 후 `npx prisma migrate dev --name add-push-unique` 실행.

- [x] **Step 6: schema.prisma PushSubscription에 unique 추가 후 마이그레이션**

`PushSubscription` 모델 마지막 줄에 추가:

```prisma
  @@unique([endpoint])
```

```bash
cd backend
DATABASE_URL="mysql://crochub:secret@localhost:3306/crochub" npx prisma migrate dev --name add-push-endpoint-unique
DATABASE_URL="mysql://crochub:secret@localhost:3306/crochub_test" npx prisma migrate deploy
```

- [x] **Step 7: app.ts에 push 라우터 마운트**

```typescript
import pushRouter from './modules/push/push.router';
app.use('/api/push', pushRouter);
```

- [x] **Step 8: 테스트 통과 확인 후 Commit**

```bash
cd backend && npm test -- tests/push.test.ts
git add backend/src/modules/push/ backend/tests/push.test.ts backend/src/app.ts backend/prisma/
git commit -m "feat(push): add PWA push subscribe and send endpoints"
```

---

## Task 8: Admin 모듈 — 미디어 타입 설정 + 사용자 관리 (TDD)

**Files:**
- Create: `backend/src/modules/admin/admin.types.ts`
- Create: `backend/src/modules/admin/admin.service.ts`
- Create: `backend/src/modules/admin/admin.router.ts`
- Create: `backend/tests/admin.test.ts`

- [x] **Step 1: backend/src/modules/admin/admin.types.ts 작성**

```typescript
export interface UpdateMediaTypeDto {
  isAllowed?: boolean;
  maxSizeMb?: number;
}
```

- [x] **Step 2: 실패하는 테스트 작성 (backend/tests/admin.test.ts)**

```typescript
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let mediaTypeId: number;

beforeAll(async () => {
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  const mt = await prisma.mediaTypeConfig.upsert({
    where: { mimeType: 'image/jpeg' },
    update: {},
    create: { mimeType: 'image/jpeg', fileCategory: 'image', maxSizeMb: 20, isAllowed: true },
  });
  mediaTypeId = mt.id;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('GET /api/admin/media-types', () => {
  it('admin이 허용 미디어 타입 목록을 조회한다', async () => {
    const res = await request(app).get('/api/admin/media-types')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('mimeType');
  });
});

describe('PUT /api/admin/media-types/:id', () => {
  it('admin이 미디어 타입을 비활성화한다', async () => {
    const res = await request(app).put(`/api/admin/media-types/${mediaTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isAllowed: false });
    expect(res.status).toBe(200);
    expect(res.body.isAllowed).toBe(false);
  });

  it('admin이 최대 용량을 변경한다', async () => {
    const res = await request(app).put(`/api/admin/media-types/${mediaTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ maxSizeMb: 50 });
    expect(res.status).toBe(200);
    expect(res.body.maxSizeMb).toBe(50);
  });
});

describe('GET /api/admin/users', () => {
  it('admin이 사용자 목록을 조회한다', async () => {
    const res = await request(app).get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((u: any) => expect(u.passwordHash).toBeUndefined());
  });
});
```

- [x] **Step 3: 테스트 실행 — 실패 확인**

```bash
cd backend && npm test -- tests/admin.test.ts
```

Expected: FAIL

- [x] **Step 4: backend/src/modules/admin/admin.service.ts 작성**

```typescript
import { prisma } from '../../lib/prisma';
import { UpdateMediaTypeDto } from './admin.types';

export async function listMediaTypes() {
  return prisma.mediaTypeConfig.findMany({ orderBy: { fileCategory: 'asc' } });
}

export async function updateMediaType(id: number, dto: UpdateMediaTypeDto) {
  const config = await prisma.mediaTypeConfig.findUnique({ where: { id } });
  if (!config) throw new Error('NOT_FOUND');
  return prisma.mediaTypeConfig.update({ where: { id }, data: dto });
}

export async function listUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, nickname: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  return { data, total, page, limit };
}

export async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('NOT_FOUND');
  if (user.role === 'admin') throw new Error('CANNOT_DELETE_ADMIN');
  await prisma.user.delete({ where: { id } });
}
```

- [x] **Step 5: backend/src/modules/admin/admin.router.ts 작성**

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import * as adminService from './admin.service';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/media-types', async (_req, res: Response) => {
  const types = await adminService.listMediaTypes();
  res.json(types);
});

router.put('/media-types/:id', async (req: Request, res: Response) => {
  try {
    const type = await adminService.updateMediaType(parseInt(req.params.id), req.body);
    res.json(type);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/users', async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await adminService.listUsers(
    page ? parseInt(page) : 1,
    limit ? parseInt(limit) : 20,
  );
  res.json(result);
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    await adminService.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'NOT_FOUND' });
    if (err.message === 'CANNOT_DELETE_ADMIN') return res.status(403).json({ error: 'CANNOT_DELETE_ADMIN' });
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
```

- [x] **Step 6: app.ts에 admin 라우터 마운트**

```typescript
import adminRouter from './modules/admin/admin.router';
app.use('/api/admin', adminRouter);
```

- [x] **Step 7: 테스트 통과 확인**

```bash
cd backend && npm test -- tests/admin.test.ts
```

Expected: PASS (5 tests)

- [x] **Step 8: Commit**

```bash
git add backend/src/modules/admin/ backend/tests/admin.test.ts backend/src/app.ts
git commit -m "feat(admin): add media-type config and user management endpoints"
```

---

## Task 9: 전체 테스트 + 최종 app.ts 확인

- [x] **Step 1: 최종 backend/src/app.ts 전체 내용 확인**

```typescript
import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import authRouter from './modules/auth/auth.router';
import postsRouter from './modules/posts/posts.router';
import mediaRouter from './modules/media/media.router';
import { commentsOnPostsRouter, commentsRouter } from './modules/comments/comments.router';
import scheduleRouter from './modules/schedule/schedule.router';
import layoutRouter from './modules/layout/layout.router';
import pushRouter from './modules/push/push.router';
import adminRouter from './modules/admin/admin.router';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/posts/:id/comments', commentsOnPostsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/layout', layoutRouter);
app.use('/api/push', pushRouter);
app.use('/api/admin', adminRouter);

app.use(errorMiddleware);

export default app;
```

- [x] **Step 2: 전체 테스트 실행**

```bash
cd backend && npm test
```

Expected: 모든 테스트 PASS (최소 35개 이상)

- [x] **Step 3: Docker 재빌드 후 전체 확인**

```bash
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run db:seed
curl http://localhost/api/health
```

Expected: `{"status":"ok"}`

- [x] **Step 4: 최종 Commit**

```bash
git add backend/src/app.ts
git commit -m "feat: complete backend core — all API modules wired up"
```

---

## 완료 기준

- [x] `npm test` — 전체 테스트 PASS
- [x] `GET /api/posts` → 200
- [x] `POST /api/media/upload` (admin token) → 201
- [x] `POST /api/posts/:id/comments` (user token) → 201
- [x] `GET /api/schedules` (admin token) → 200
- [x] `GET /api/layout` (공개) → 200
- [x] `POST /api/push/subscribe` (user token) → 201
- [x] `GET /api/admin/media-types` (admin token) → 200
- [x] Docker 전체 스택 정상 기동
