import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

// Mock S3/R2 upload and delete operations
jest.mock('../src/lib/r2', () => ({
  uploadToR2: jest.fn().mockResolvedValue('https://test.r2.dev/fake-key.png'),
  deleteFromR2: jest.fn().mockResolvedValue(undefined),
  r2: {
    send: jest.fn().mockResolvedValue(undefined),
  },
  R2_BUCKET: 'test-bucket',
  R2_PUBLIC_URL: 'https://test.r2.dev',
}));

// Mock native fetch for downloading the original file in regeneration tests
const mockPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const mockPngBuffer = Buffer.from(mockPngBase64, 'base64');

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    arrayBuffer: () => {
      // Isolate exact bytes into a fresh ArrayBuffer instead of returning the shared buffer pool
      const ab = new ArrayBuffer(mockPngBuffer.length);
      const view = new Uint8Array(ab);
      for (let i = 0; i < mockPngBuffer.length; ++i) {
        view[i] = mockPngBuffer[i];
      }
      return Promise.resolve(ab);
    },
  })
) as jest.Mock;

describe('Media Derivatives pipeline integration tests', () => {
  let adminToken: string;
  let userToken: string;
  let imageMediaId: number;
  let textMediaId: number;

  beforeAll(async () => {
    // Clean database media and derivatives tables
    await prisma.mediaDerivative.deleteMany();
    await prisma.media.deleteMany();
    await prisma.user.deleteMany();

    // Create Admin User
    await request(app).post('/api/auth/register').send({
      email: 'admin@derivatives.com',
      password: 'password123',
      nickname: 'AdminDeriv',
    });
    await prisma.user.update({
      where: { email: 'admin@derivatives.com' },
      data: { role: 'admin' },
    });
    const loginAdmin = await request(app).post('/api/auth/login').send({
      email: 'admin@derivatives.com',
      password: 'password123',
    });
    adminToken = loginAdmin.body.token;

    // Create Standard User
    await request(app).post('/api/auth/register').send({
      email: 'user@derivatives.com',
      password: 'password123',
      nickname: 'UserDeriv',
    });
    const loginUser = await request(app).post('/api/auth/login').send({
      email: 'user@derivatives.com',
      password: 'password123',
    });
    userToken = loginUser.body.token;

    // Seed Allowed MIME configs
    await prisma.mediaTypeConfig.upsert({
      where: { mimeType: 'image/png' },
      update: { isAllowed: true, maxSizeMb: 20 },
      create: { mimeType: 'image/png', fileCategory: 'image', maxSizeMb: 20, isAllowed: true },
    });
    await prisma.mediaTypeConfig.upsert({
      where: { mimeType: 'text/plain' },
      update: { isAllowed: true, maxSizeMb: 5 },
      create: { mimeType: 'text/plain', fileCategory: 'document', maxSizeMb: 5, isAllowed: true },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should upload image, and spawn background derivative generation', async () => {
    const res = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', mockPngBuffer, {
        filename: 'pixel.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    imageMediaId = res.body.id;

    // Wait for async background derivatives to complete
    await new Promise((resolve) => setTimeout(resolve, 150));

    const derivatives = await prisma.mediaDerivative.findMany({
      where: { mediaId: imageMediaId },
    });

    expect(derivatives.length).toBe(3); // thumb_small, thumb_medium, web_optimized
    const types = derivatives.map((d) => d.derivativeType);
    expect(types).toContain('thumb_small');
    expect(types).toContain('thumb_medium');
    expect(types).toContain('web_optimized');
  });

  it('should upload non-image document, skipping derivative generation', async () => {
    const res = await request(app)
      .post('/api/media/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from('plain txt content'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(201);
    textMediaId = res.body.id;

    await new Promise((resolve) => setTimeout(resolve, 50));

    const derivatives = await prisma.mediaDerivative.findMany({
      where: { mediaId: textMediaId },
    });
    expect(derivatives.length).toBe(0);
  });

  it('should reject non-admin requests to fetch and regenerate derivatives', async () => {
    // 1. GET derivatives list
    const resGet = await request(app)
      .get(`/api/media/${imageMediaId}/derivatives`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(resGet.status).toBe(403);

    // 2. POST regenerate
    const resRegen = await request(app)
      .post(`/api/media/${imageMediaId}/derivatives/regenerate`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(resRegen.status).toBe(403);
  });

  it('should allow admin to list and manually trigger derivative regeneration', async () => {
    // 1. Get derivatives list
    const resGet = await request(app)
      .get(`/api/media/${imageMediaId}/derivatives`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(resGet.body.length).toBe(3);

    // Clear derivatives to verify they are re-created on demand
    await prisma.mediaDerivative.deleteMany({ where: { mediaId: imageMediaId } });

    // 2. Trigger regeneration
    const resRegen = await request(app)
      .post(`/api/media/${imageMediaId}/derivatives/regenerate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(resRegen.body.status).toBe('SUCCESS');

    await new Promise((resolve) => setTimeout(resolve, 150));

    const derivatives = await prisma.mediaDerivative.findMany({
      where: { mediaId: imageMediaId },
    });
    expect(derivatives.length).toBe(3);
  });
});
