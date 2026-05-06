import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Admin Media-Types Config API Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let testMediaTypeId: number;

  beforeAll(async () => {
    // DB 초기 청소
    await prisma.mediaTypeConfig.deleteMany();
    await prisma.user.deleteMany();

    // 임시 테스트용 미디어 타입 데이터 생성
    const config = await prisma.mediaTypeConfig.create({
      data: {
        mimeType: 'image/jpeg',
        fileCategory: 'image',
        maxSizeMb: 10,
        isAllowed: true,
      },
    });
    testMediaTypeId = config.id;

    // 테스트용 계정 생성 및 토큰 획득
    // 1) 일반 사용자
    await request(app).post('/api/auth/register').send({
      email: 'user_setting@test.com',
      password: 'password123',
      nickname: '일반세팅',
    });
    const loginUser = await request(app).post('/api/auth/login').send({
      email: 'user_setting@test.com',
      password: 'password123',
    });
    userToken = loginUser.body.token;

    // 2) 어드민 사용자 가입 및 권한 승격
    await request(app).post('/api/auth/register').send({
      email: 'admin_setting@test.com',
      password: 'password123',
      nickname: '어드민세팅',
    });
    
    await prisma.user.update({
      where: { email: 'admin_setting@test.com' },
      data: { role: 'admin' },
    });

    const loginAdmin = await request(app).post('/api/auth/login').send({
      email: 'admin_setting@test.com',
      password: 'password123',
    });
    adminToken = loginAdmin.body.token;
  });

  afterAll(async () => {
    await prisma.mediaTypeConfig.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/admin/media-types', () => {
    it('인증 토큰이 없으면 401을 반환한다', async () => {
      const res = await request(app).get('/api/admin/media-types');
      expect(res.status).toBe(401);
    });

    it('일반 사용자 권한으로 요청하면 403을 반환한다', async () => {
      const res = await request(app).get('/api/admin/media-types')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('어드민 권한으로 요청하면 200과 설정 목록을 반환한다', async () => {
      const res = await request(app).get('/api/admin/media-types')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].mimeType).toBe('image/jpeg');
    });
  });

  describe('PUT /api/admin/media-types/:id', () => {
    it('일반 사용자는 미디어 업로드 정책을 변경할 수 없다 (403)', async () => {
      const res = await request(app).put(`/api/admin/media-types/${testMediaTypeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isAllowed: false, maxSizeMb: 20 });

      expect(res.status).toBe(403);
    });

    it('바디 데이터 형식이 올바르지 않으면 400을 반환한다', async () => {
      const res = await request(app).put(`/api/admin/media-types/${testMediaTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAllowed: 'yes', maxSizeMb: 'twenty' }); // 잘못된 타입

      expect(res.status).toBe(400);
    });

    it('어드민 권한으로 업로드 규칙을 변경하면 200을 반환하고 DB에 저장된다', async () => {
      const res = await request(app).put(`/api/admin/media-types/${testMediaTypeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAllowed: false, maxSizeMb: 50 });

      expect(res.status).toBe(200);
      expect(res.body.isAllowed).toBe(false);
      expect(res.body.maxSizeMb).toBe(50);

      // 실제 DB 반영 확인
      const dbRecord = await prisma.mediaTypeConfig.findUnique({ where: { id: testMediaTypeId } });
      expect(dbRecord?.isAllowed).toBe(false);
      expect(dbRecord?.maxSizeMb).toBe(50);
    });
  });
});
