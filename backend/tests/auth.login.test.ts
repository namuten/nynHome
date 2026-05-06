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
