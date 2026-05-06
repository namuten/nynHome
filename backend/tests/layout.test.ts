import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let postIds: number[] = [];

beforeAll(async () => {
  await prisma.contentLayout.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  // 3개 포스트 생성
  const p1 = await prisma.post.create({ data: { title: '1', body: '1', category: 'blog' } });
  const p2 = await prisma.post.create({ data: { title: '2', body: '2', category: 'blog' } });
  const p3 = await prisma.post.create({ data: { title: '3', body: '3', category: 'blog' } });
  postIds = [p1.id, p2.id, p3.id];
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
      { sectionKey: 'hero', postIds: [postIds[0], postIds[1]], order: 0, isVisible: true },
      { sectionKey: 'featured', postIds: [postIds[2]], order: 1, isVisible: true },
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

  it('배열이 아닌 body 요청은 400을 받는다', async () => {
    const res = await request(app)
      .put('/api/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ sectionKey: 'hero' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('중복된 sectionKey 요청은 400을 받는다', async () => {
    const sections = [
      { sectionKey: 'hero', postIds: [postIds[0]], order: 0, isVisible: true },
      { sectionKey: 'hero', postIds: [postIds[1]], order: 1, isVisible: true },
    ];
    const res = await request(app)
      .put('/api/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sections);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('존재하지 않는 postIds가 포함되면 400을 받는다', async () => {
    const sections = [
      { sectionKey: 'hero', postIds: [999999], order: 0, isVisible: true },
    ];
    const res = await request(app)
      .put('/api/layout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(sections);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_POST_IDS');
  });
});
