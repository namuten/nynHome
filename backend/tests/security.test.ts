import request from 'supertest';
import app from '../src/app';

describe('Security Headers & Request ID Middleware', () => {
  it('GET /api/health returns a unique X-Request-ID response header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.header).toHaveProperty('x-request-id');
    expect(res.header['x-request-id']).toMatch(/^[a-zA-Z0-9-]+$/);
  });

  it('reflects incoming valid X-Request-ID header in response', async () => {
    const customId = 'test-custom-request-id-12345';
    const res = await request(app)
      .get('/api/health')
      .set('X-Request-ID', customId);
    expect(res.status).toBe(200);
    expect(res.header['x-request-id']).toBe(customId);
  });

  it('applies standard security headers to response', async () => {
    const res = await request(app).get('/api/health');
    expect(res.header['x-content-type-options']).toBe('nosniff');
    expect(res.header['x-frame-options']).toBe('DENY');
    expect(res.header['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.header['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
  });
});
