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
  it('잘못된 카테고리로 요청하면 400을 반환한다', async () => {
    const res = await request(app).get('/api/posts?category=invalid');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('잘못된 페이지로 요청하면 400을 반환한다', async () => {
    const res = await request(app).get('/api/posts?page=-1');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
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

  it('빈 제목으로 요청하면 400을 반환한다', async () => {
    const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '', body: '내용', category: 'creative' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('잘못된 카테고리로 요청하면 400을 반환한다', async () => {
    const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '제목', body: '내용', category: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
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
