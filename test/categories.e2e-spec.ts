import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import {
  MOCK_CATEGORIES,
  setupApp,
  signInAdmin,
  signInUser,
} from './appUtils.js';

describe('Categories', async () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await setupApp();
  });

  describe('/categories (GET)', async () => {
    it('Fetches categories', async () => {
      await request(app.getHttpServer())
        .get('/category')
        .expect(200)
        .expect(MOCK_CATEGORIES);
    });
  });

  describe('/categories (POST)', async () => {
    it('Does not allow unauthenticated or non admins', async () => {
      const token = await signInUser(app);
      await request(app.getHttpServer())
        .post('/category')
        .auth(token, { type: 'bearer' })
        .send({ name: 'test' })
        .expect(403);

      await request(app.getHttpServer())
        .post('/category')
        .send({ name: 'test' })
        .expect(401);
    });

    it('Does not allow invalid values', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .post('/category')
        .auth(token, { type: 'bearer' })
        .send({})
        .expect(400);

      await request(app.getHttpServer())
        .post('/category')
        .auth(token, { type: 'bearer' })
        .send({ name: 1 })
        .expect(400);
      await request(app.getHttpServer())
        .post('/category')
        .auth(token, { type: 'bearer' })
        .send({ name: 1 })
        .expect(400);
    });

    it('Creates a category', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .post('/category')
        .auth(token, { type: 'bearer' })
        .send({ name: 'test' })
        .expect(201)
        .expect({ id: 3, name: 'test' });
    });
  });

  describe('/categories/:id (PATCH)', async () => {
    it('Does not allow unauthenticated or non admins', async () => {
      const token = await signInUser(app);
      await request(app.getHttpServer())
        .patch('/category/1')
        .auth(token, { type: 'bearer' })
        .send({ name: 'test' })
        .expect(403);

      await request(app.getHttpServer())
        .patch('/category/1')
        .send({ name: 'test' })
        .expect(401);
    });

    it('Does not allow invalid values', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch('/category/1')
        .auth(token, { type: 'bearer' })
        .send('1')
        .expect(400);

      await request(app.getHttpServer())
        .patch('/category/1')
        .auth(token, { type: 'bearer' })
        .send({ name: 1 })
        .expect(400);

      await request(app.getHttpServer())
        .patch('/category/1')
        .auth(token, { type: 'bearer' })
        .send({ name: 'good', junk: 1 })
        .expect(400);
    });

    it('Returns 404 for a missing category', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch('/category/999')
        .auth(token, { type: 'bearer' })
        .send({ name: 'good' })
        .expect(404);
    });

    it('Updates a category', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch('/category/1')
        .auth(token, { type: 'bearer' })
        .send({ name: 'good' })
        .expect(200)
        .expect({ id: 1, name: 'good' });
    });
  });

  describe('/categories/:id (DELETE)', async () => {
    it('Does not allow unauthenticated or non admins', async () => {
      const token = await signInUser(app);
      await request(app.getHttpServer())
        .delete('/category/1')
        .auth(token, { type: 'bearer' })
        .expect(403);

      await request(app.getHttpServer()).delete('/category/1').expect(401);
    });

    it('Returns 404 for a missing category', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete('/category/999')
        .auth(token, { type: 'bearer' })
        .expect(404);
    });

    it('Deletes a category', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete('/category/1')
        .auth(token, { type: 'bearer' })
        .expect(204);

      await request(app.getHttpServer())
        .get('/category')
        .expect(200)
        .expect([MOCK_CATEGORIES[1]]);
    });
  });

  afterAll(async () => await app.close());
});
