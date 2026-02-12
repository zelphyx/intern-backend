import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';

interface AuthResponse {
  message: string;
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface PostResponse {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  author: {
    username: string;
  };
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  bio?: string;
  password?: string;
  posts?: PostResponse[];
}

interface MessageResponse {
  message: string;
}

describe('Blog API - E2E Tests (Auth & Token)', () => {
  let app: INestApplication;
  let server: App;
  let accessToken: string;
  let userId: number;
  let postId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  //TESTING AUTH

  describe('Auth - Registration', () => {
    it('/api/auth/register (POST) - should register a new user', () => {
      return request(server)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as AuthResponse;
          expect(body.message).toBe('Registration successful');
          expect(body.access_token).toBeDefined();
          expect(body.user.username).toBe('testuser');
          expect(body.user.email).toBe('test@example.com');
          expect(body.user.id).toBeDefined();
          accessToken = body.access_token;
          userId = body.user.id;
        });
    });

    it('/api/auth/register (POST) - should fail with duplicate username', () => {
      return request(server)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'another@example.com',
          password: 'password123',
        })
        .expect(409);
    });

    it('/api/auth/register (POST) - should fail with invalid email', () => {
      return request(server)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('/api/auth/register (POST) - should fail with short password', () => {
      return request(server)
        .post('/api/auth/register')
        .send({
          username: 'newuser2',
          email: 'new2@example.com',
          password: '123',
        })
        .expect(400);
    });
  });

  describe('Auth - Login', () => {
    it('/api/auth/login (POST) - should login with valid credentials', () => {
      return request(server)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as AuthResponse;
          expect(body.message).toBe('Login successful');
          expect(body.access_token).toBeDefined();
          expect(body.user.username).toBe('testuser');
          // Update token
          accessToken = body.access_token;
        });
    });

    it('/api/auth/login (POST) - should fail with wrong password', () => {
      return request(server)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/api/auth/login (POST) - should fail with non-existent user', () => {
      return request(server)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);
    });
  });

  // TOKEN VALIDATION TEST

  describe('Auth - Token Validation', () => {
    it('/api/auth/profile (GET) - should return profile with valid token', () => {
      return request(server)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as UserResponse;
          expect(body.username).toBe('testuser');
          expect(body.email).toBe('test@example.com');
          expect(body.password).toBeUndefined();
        });
    });

    it('/api/auth/profile (GET) - should fail without token', () => {
      return request(server).get('/api/auth/profile').expect(401);
    });

    it('/api/auth/profile (GET) - should fail with invalid token', () => {
      return request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });

    it('/api/auth/profile (GET) - should fail with malformed auth header', () => {
      return request(server)
        .get('/api/auth/profile')
        .set('Authorization', 'NotBearer sometoken')
        .expect(401);
    });
  });

  // CRUD TOKEN TEST

  describe('Posts - Create (Auth Required)', () => {
    it('/api/posts (POST) - should create a post with valid token', () => {
      return request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'My First Post',
          content:
            'This is the content of my first blog post with enough characters.',
          published: true,
        })
        .expect(201)
        .expect((res) => {
          const body = res.body as PostResponse;
          expect(body.title).toBe('My First Post');
          expect(body.authorId).toBe(userId);
          expect(body.author).toBeDefined();
          expect(body.author.username).toBe('testuser');
          postId = body.id;
        });
    });

    it('/api/posts (POST) - should fail without token', () => {
      return request(server)
        .post('/api/posts')
        .send({
          title: 'Unauthorized Post',
          content: 'This should fail because there is no token.',
        })
        .expect(401);
    });

    it('/api/posts (POST) - should fail with invalid data', () => {
      return request(server)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'AB', // too short
          content: 'short', // too short
        })
        .expect(400);
    });
  });

  describe('Posts - Read', () => {
    it('/api/posts (GET) - should get all published posts', () => {
      return request(server)
        .get('/api/posts')
        .expect(200)
        .expect((res) => {
          const body = res.body as PostResponse[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });

    it('/api/posts/:id (GET) - should get a post by ID', () => {
      return request(server)
        .get(`/api/posts/${postId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as PostResponse;
          expect(body.id).toBe(postId);
          expect(body.title).toBe('My First Post');
          expect(body.author).toBeDefined();
        });
    });

    it('/api/posts/:id (GET) - should return 404 for non-existent post', () => {
      return request(server).get('/api/posts/9999').expect(404);
    });

    it('/api/posts/my-posts (GET) - should get posts by authenticated user', () => {
      return request(server)
        .get('/api/posts/my-posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as PostResponse[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
          body.forEach((post) => {
            expect(post.authorId).toBe(userId);
          });
        });
    });
  });

  describe('Posts - Update (Auth Required)', () => {
    it('/api/posts/:id (PATCH)', () => {
      return request(server)
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Updated Post Title',
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as PostResponse;
          expect(body.title).toBe('Updated Post Title');
        });
    });

    it('/api/posts/:id (PATCH) - should fail without token', () => {
      return request(server)
        .patch(`/api/posts/${postId}`)
        .send({
          title: 'Should Fail',
        })
        .expect(401);
    });
  });

  // ==========================================
  // USERS - CRUD Tests
  // ==========================================

  describe('Users - Read', () => {
    it('/api/users (GET) - should get all users', () => {
      return request(server)
        .get('/api/users')
        .expect(200)
        .expect((res) => {
          const body = res.body as UserResponse[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
          // Ensure password is not exposed
          body.forEach((user) => {
            expect(user.password).toBeUndefined();
          });
        });
    });

    it('/api/users/:id (GET) - should get user with posts', () => {
      return request(server)
        .get(`/api/users/${userId}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as UserResponse;
          expect(body.username).toBe('testuser');
          expect(body.posts).toBeDefined();
          expect(Array.isArray(body.posts)).toBe(true);
          expect(body.password).toBeUndefined();
        });
    });

    it('/api/users/:id (GET) - should return 404 for non-existent user', () => {
      return request(server).get('/api/users/9999').expect(404);
    });
  });

  describe('Users - Update (Auth Required)', () => {
    it('/api/users/:id (PATCH) - should update user with token', () => {
      return request(server)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          bio: 'Updated bio from e2e test',
        })
        .expect(200)
        .expect((res) => {
          const body = res.body as UserResponse;
          expect(body.bio).toBe('Updated bio from e2e test');
        });
    });

    it('/api/users/:id (PATCH) - should fail without token', () => {
      return request(server)
        .patch(`/api/users/${userId}`)
        .send({
          bio: 'Should fail',
        })
        .expect(401);
    });
  });

  describe('Cross-entity - User-Post Relationship', () => {
    it('should register second user and verify isolation', async () => {
      // Register second user
      const registerRes = await request(server)
        .post('/api/auth/register')
        .send({
          username: 'seconduser',
          email: 'second@example.com',
          password: 'password123',
        })
        .expect(201);

      const secondToken = (registerRes.body as AuthResponse).access_token;

      // Second user shouldn't be able to update first user's post
      await request(server)
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ title: 'Hijacked!' })
        .expect(403);

      // Second user shouldn't be able to delete first user's post
      await request(server)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(403);
    });
  });

  describe('Cleanup - Delete Operations', () => {
    it('/api/posts/:id (DELETE) - should delete own post', () => {
      return request(server)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as MessageResponse;
          expect(body.message).toContain('deleted');
        });
    });

    it('/api/posts/:id (DELETE) - deleted post should return 404', () => {
      return request(server).get(`/api/posts/${postId}`).expect(404);
    });
  });
});
