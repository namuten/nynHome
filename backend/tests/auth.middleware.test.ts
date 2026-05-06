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
