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
