import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('새 사용자를 등록한다', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123', nickname: '테스터' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.nickname).toBe('테스터');
    expect(res.body.role).toBe('user');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('이미 존재하는 이메일이면 409를 반환한다', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123', nickname: '테스터' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'other123', nickname: '다른사람' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('EMAIL_TAKEN');
  });
});
