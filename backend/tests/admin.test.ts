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
