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

  // Register admin & user
  await request(app).post('/api/auth/register').send({ email: 'admin@test.com', password: 'pw123', nickname: 'Admin' });
  await prisma.user.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });
  adminToken = (await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'pw123' })).body.token;

  await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'pw123', nickname: 'User' });
  userToken = (await request(app).post('/api/auth/login').send({ email: 'user@test.com', password: 'pw123' })).body.token;

  // Create a post
  const post = await request(app).post('/api/posts')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: '테스트용 게시글', body: '내용입니다.', category: 'blog', isPublished: true });
  postId = post.body.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Rate Limiting & Spam Protection Integration Tests', () => {
  it('prevents comments containing more than 2 links (URL cap)', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-Spam-Guard', 'true')
      .send({ body: '링크 모음: http://g.co http://yahoo.com http://naver.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('SPAM_DETECTED');
    expect(res.body.message).toContain('링크(URL)가 포함되어 있습니다');
  });

  it('prevents comments containing excessively repeating characters', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-Spam-Guard', 'true')
      .send({ body: 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('SPAM_DETECTED');
    expect(res.body.message).toContain('반복 문자가 감지되었습니다');
  });

  it('prevents short-term duplicate comments from the same user (double post guard)', async () => {
    // First comment succeeds
    const res1 = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-Spam-Guard', 'true')
      .send({ body: '고유한 유일 댓글 내용' });
    expect(res1.status).toBe(201);

    // Immediate duplicate fails
    const res2 = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${userToken}`)
      .set('X-Test-Spam-Guard', 'true')
      .send({ body: '고유한 유일 댓글 내용' });
    expect(res2.status).toBe(429);
    expect(res2.body.error).toBe('SPAM_DETECTED');
    expect(res2.body.message).toContain('동일한 내용입니다');
  });

  it('limits login attempts on POST /api/auth/login after 5 failed tries', async () => {
    // 5 attempts can fail or succeed, but on the 6th it must be rate limited with 429
    // Since we registered 'user@test.com' above, we will make multiple requests
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .set('X-Test-Rate-Limit', 'true')
        .send({ email: 'user@test.com', password: 'wrongpassword' });
    }

    const res6 = await request(app)
      .post('/api/auth/login')
      .set('X-Test-Rate-Limit', 'true')
      .send({ email: 'user@test.com', password: 'wrongpassword' });

    expect(res6.status).toBe(429);
    expect(res6.body.error).toBe('RATE_LIMITED');
  });
});
