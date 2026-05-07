import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let adminToken: string;
let regularUserToken: string;

beforeAll(async () => {
  // Clean up previous runs
  await prisma.backupRun.deleteMany();
  await prisma.user.deleteMany();

  // Create an Admin user
  await request(app).post('/api/auth/register').send({
    email: 'ops_admin@test.com',
    password: 'securePassword123',
    nickname: 'Ops Admin',
  });
  await prisma.user.update({
    where: { email: 'ops_admin@test.com' },
    data: { role: 'admin' },
  });
  
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'ops_admin@test.com',
    password: 'securePassword123',
  });
  adminToken = adminLogin.body.token;

  // Create a Regular user
  await request(app).post('/api/auth/register').send({
    email: 'ops_user@test.com',
    password: 'userPassword123',
    nickname: 'Regular User',
  });
  
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'ops_user@test.com',
    password: 'userPassword123',
  });
  regularUserToken = userLogin.body.token;
});

afterAll(async () => {
  await prisma.backupRun.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Admin Operations & System Diagnostics Integration Tests', () => {
  describe('GET /api/admin/system/health', () => {
    it('should reject requests from unauthorized users (no token)', async () => {
      const res = await request(app).get('/api/admin/system/health');
      expect(res.status).toBe(401);
    });

    it('should reject requests from non-admin authenticated users', async () => {
      const res = await request(app)
        .get('/api/admin/system/health')
        .set('Authorization', `Bearer ${regularUserToken}`);
      expect(res.status).toBe(403);
    });

    it('should return complete health parameters when requested by an authorized admin', async () => {
      const res = await request(app)
        .get('/api/admin/system/health')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('database', 'ok');
      expect(res.body).toHaveProperty('storage', 'ok');
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('version');
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });
  });

  describe('GET /api/admin/backup-runs', () => {
    it('should return empty logs list initially for authorized admin', async () => {
      const res = await request(app)
        .get('/api/admin/backup-runs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total', 0);
      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.items.length).toBe(0);
    });
  });

  describe('POST /api/admin/backup-runs/db', () => {
    it('should asynchronously trigger backup process and register RUNNING audit run', async () => {
      const res = await request(app)
        .post('/api/admin/backup-runs/db')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(202); // 202 Accepted
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('backupType', 'DATABASE');
      expect(res.body).toHaveProperty('status', 'RUNNING');
      expect(res.body).toHaveProperty('startedAt');

      // Verify the record exists in database
      const dbRecord = await prisma.backupRun.findUnique({
        where: { id: res.body.id },
      });
      expect(dbRecord).not.toBeNull();
      expect(dbRecord?.status).toBe('RUNNING');
    });

    it('should now return the registered running backup run in listings', async () => {
      const res = await request(app)
        .get('/api/admin/backup-runs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.items[0]).toHaveProperty('status', 'RUNNING');
    });
  });
});
