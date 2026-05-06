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
    const res = await request(app).post(`/api/posts/${postId}/comments`).send({ body: '댓글' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/posts/:id/comments', () => {
  it('게시물의 댓글 목록을 반환한다', async () => {
    const res = await request(app).get(`/api/posts/${postId}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('PUT /api/comments/:id/reply', () => {
  it('admin이 댓글에 답글을 단다', async () => {
    const c = await request(app).post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`).send({ body: '질문있어요' });
    const res = await request(app).put(`/api/comments/${c.body.id}/reply`)
      .set('Authorization', `Bearer ${adminToken}`).send({ reply: '답변입니다' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('답변입니다');
  });
});

describe('DELETE /api/comments/:id', () => {
  it('작성자가 자신의 댓글을 삭제(숨김 처리)한다', async () => {
    const c = await request(app).post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`).send({ body: '지울댓글' });
    const res = await request(app).delete(`/api/comments/${c.body.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(204);
  });

  it('admin은 다른 사람의 댓글을 삭제(숨김)할 수 있다', async () => {
    const c = await request(app).post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`).send({ body: '어그로' });
    const res = await request(app).delete(`/api/comments/${c.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
