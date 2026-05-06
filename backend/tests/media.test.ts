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
