import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Sitemap & Robots integration tests', () => {
  let publishedPostId: number;
  let draftPostId: number;

  beforeAll(async () => {
    // Setup mock posts
    const p1 = await prisma.post.create({
      data: {
        title: 'Sitemap Published Test Post',
        body: 'Sitemap Test Content',
        category: 'creative',
        isPublished: true,
      },
    });
    publishedPostId = p1.id;

    const p2 = await prisma.post.create({
      data: {
        title: 'Sitemap Draft Test Post',
        body: 'Sitemap Test Content',
        category: 'study',
        isPublished: false,
      },
    });
    draftPostId = p2.id;
  });

  afterAll(async () => {
    // Clean up mock posts
    await prisma.post.deleteMany({
      where: {
        id: { in: [publishedPostId, draftPostId] },
      },
    });
  });

  it('should return valid sitemap.xml with correct headers', async () => {
    const res = await request(app)
      .get('/sitemap.xml')
      .expect(200);

    expect(res.header['content-type']).toContain('application/xml');
    
    // Validate published post is present
    expect(res.text).toContain(`/post/${publishedPostId}`);
    
    // Validate draft post is NOT present
    expect(res.text).not.toContain(`/post/${draftPostId}`);
  });

  it('should return valid robots.txt with correct headers', async () => {
    const res = await request(app)
      .get('/robots.txt')
      .expect(200);

    expect(res.header['content-type']).toContain('text/plain');
    expect(res.text).toContain('User-agent: *');
    expect(res.text).toContain('/sitemap.xml');
  });
});
export {};
