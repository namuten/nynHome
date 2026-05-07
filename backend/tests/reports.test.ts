import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

let userToken: string;
let commentId: number;
let postId: number;

beforeAll(async () => {
  await prisma.commentReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create a user
  await request(app).post('/api/auth/register').send({
    email: 'reporter@test.com',
    password: 'password123',
    nickname: 'Reporter',
  });
  
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'reporter@test.com',
    password: 'password123',
  });
  userToken = loginRes.body.token;

  // Create a post
  const post = await prisma.post.create({
    data: {
      title: 'Test Post',
      body: 'Content',
      category: 'blog',
      isPublished: true,
    },
  });
  postId = post.id;

  // Create another user to be the comment author
  const author = await prisma.user.create({
    data: {
      email: 'author@test.com',
      passwordHash: 'hashed',
      nickname: 'Author',
    },
  });

  // Create a comment
  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: author.id,
      body: 'This is an offensive comment.',
    },
  });
  commentId = comment.id;
});

afterAll(async () => {
  await prisma.commentReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Comment Reports Integration Tests', () => {
  it('should reject report creation if not authenticated', async () => {
    const res = await request(app)
      .post(`/api/comments/${commentId}/reports`)
      .send({ reason: 'spam' });
      
    expect(res.status).toBe(401);
  });

  it('should reject report creation if reason is invalid', async () => {
    const res = await request(app)
      .post(`/api/comments/${commentId}/reports`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'invalid_reason' });
      
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should successfully create a comment report', async () => {
    const res = await request(app)
      .post(`/api/comments/${commentId}/reports`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        reason: 'harassment',
        description: 'The comment is attacking me directly.'
      });
      
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.reason).toBe('harassment');
    expect(res.body.status).toBe('open');
    expect(res.body.commentId).toBe(commentId);
  });

  it('should reject duplicate report from the same user on the same comment', async () => {
    const res = await request(app)
      .post(`/api/comments/${commentId}/reports`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'spam' });
      
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ALREADY_REPORTED');
  });

  it('should return 404 when reporting a non-existent comment', async () => {
    const res = await request(app)
      .post(`/api/comments/999999/reports`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'spam' });
      
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('COMMENT_NOT_FOUND');
  });
});
