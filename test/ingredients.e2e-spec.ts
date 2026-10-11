import {
  INestApplication,
  StandardSchemaSerializerInterceptor,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types.js';
import request from 'supertest';
import { IngredientsModule } from '../src/ingredients/ingredients.module.js';
import { IngredientsService } from '../src/ingredients/ingredients.service.js';
import { randomUUID } from 'crypto';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

describe('IngredientsController (e2e)', () => {
  let app: INestApplication<App>;

  const ingredientsSerivce = {
    findPaginated: vi.fn(),
    update: vi.fn(),
    find: vi.fn(),
    remove: vi.fn(),
    create: vi.fn(),
  };
  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IngredientsModule],
      providers: [
        {
          provide: APP_PIPE,
          useClass: StandardSchemaValidationPipe,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: StandardSchemaSerializerInterceptor,
        },
      ],
    })
      .overrideProvider(IngredientsService)
      .useValue(ingredientsSerivce)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    await app.init();
  });

  describe('/ingredients (GET)', () => {
    it.each([
      { case: 'no page' },
      { case: 'string page', page: 'a' },
      { case: 'negative page', page: -1 },
      { case: 'string pageSize', page: 0, pageSize: 'a' },
      { case: 'zero pageSize', page: 0, pageSize: 0 },
      { case: '101 pageSize', page: 0, pageSize: 101 },
      { case: 'float pageSize', page: 0, pageSize: 1.123 },
      { case: 'float page', page: 1.123 },
    ])('Should reject $case', async ({ page, pageSize }) => {
      const params = new URLSearchParams();
      if (page !== undefined) params.set('page', page.toString());
      if (pageSize !== undefined) params.set('pageSize', pageSize.toString());

      await request(app.getHttpServer())
        .get(`/ingredients?${params.toString()}`)
        .expect(400);
      expect(ingredientsSerivce.findPaginated).not.toHaveBeenCalled();
    });

    it('Should validate and strip reponse', async () => {
      ingredientsSerivce.findPaginated.mockResolvedValue({
        total: 1,
        ingredients: [
          {
            junk: 1,
          },
        ],
      });
      await request(app.getHttpServer()).get('/ingredients?page=0').expect(500);
      expect(ingredientsSerivce.findPaginated).toHaveBeenCalledOnce();

      const ingredient = {
        id: randomUUID(),
        name: 'a',
        description: 'a',
        alcoholic: false,
        imagePath: null,
      };
      ingredientsSerivce.findPaginated.mockResolvedValue({
        total: 1,
        ingredients: [{ ...ingredient, junk: 1 }], //check if junk is stripped.
      });

      await request(app.getHttpServer())
        .get('/ingredients?page=0')
        .expect(200)
        .expect({
          pageCount: 1,
          ingredients: [ingredient],
        });
      expect(ingredientsSerivce.findPaginated).toHaveBeenCalledTimes(2);
    });

    it('Should return the correct page count', async () => {
      ingredientsSerivce.findPaginated.mockResolvedValue({
        total: 0,
        ingredients: [],
      });
      await request(app.getHttpServer())
        .get('/ingredients?page=0&pageSize=10')
        .expect({ pageCount: 1, ingredients: [] });

      ingredientsSerivce.findPaginated.mockResolvedValue({
        total: 29,
        ingredients: [],
      });

      await request(app.getHttpServer())
        .get('/ingredients?page=0&pageSize=10')
        .expect(200)
        .expect({ pageCount: 3, ingredients: [] });
    });
  });

  describe('/ingredients (POST)', () => {
    const baseBody = {
      name: 'a',
      description: 'b',
      alcoholic: true,
    };

    it.each([
      { case: 'empty body', body: {} },
      {
        case: 'missing name',
        body: { ...baseBody, name: undefined },
      },
      {
        case: 'empty name',
        body: { ...baseBody, name: '' },
      },
      {
        case: 'non-string name',
        body: { ...baseBody, name: 1 },
      },
      {
        case: 'missing description',
        body: { ...baseBody, description: undefined },
      },
      {
        case: 'empty description',
        body: { ...baseBody, description: '' },
      },
      {
        case: 'missing alcoholic',
        body: { ...baseBody, alcoholic: undefined },
      },
      {
        case: 'non-boolean alcoholic',
        body: { ...baseBody, alcoholic: 'true' },
      },
      {
        case: 'id',
        body: { ...baseBody, id: randomUUID() },
      },
      {
        case: 'imagePath',
        body: {
          ...baseBody,
          imagePath: 'http://localhost:3000',
        },
      },
    ])('Should reject $case', async ({ body }) => {
      await request(app.getHttpServer())
        .post('/ingredients')
        .send(body)
        .expect(400);
      expect(ingredientsSerivce.create).not.toHaveBeenCalled();
    });

    it('Should validate and strip response', async () => {
      ingredientsSerivce.create.mockResolvedValue({
        junk: 1,
      });
      await request(app.getHttpServer())
        .post('/ingredients')
        .send(baseBody)
        .expect(500);

      expect(ingredientsSerivce.create).toHaveBeenCalled();

      const ingredient = {
        id: randomUUID(),
        ...baseBody,
        imagePath: null,
      };
      //Verify that junk is stripped away.
      ingredientsSerivce.create.mockResolvedValue({
        ...ingredient,
        junk: 1,
      });
      await request(app.getHttpServer())
        .post('/ingredients')
        .send(baseBody)
        .expect(201)
        .expect(ingredient);

      expect(ingredientsSerivce.create).toHaveBeenLastCalledWith(baseBody);
      expect(ingredientsSerivce.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('/ingredients/:id (GET)', () => {
    it('Should reject invalid uuid', async () => {
      await request(app.getHttpServer()).get('/ingredients/a').expect(400);
      expect(ingredientsSerivce.find).not.toHaveBeenCalled();
    });

    it('Should check if the ingredient exists.', async () => {
      const uuid = randomUUID();
      ingredientsSerivce.remove.mockResolvedValue(null);
      await request(app.getHttpServer())
        .get(`/ingredients/${uuid}`)
        .expect(404);
      expect(ingredientsSerivce.find).toHaveBeenCalledOnce();
      expect(ingredientsSerivce.find).toHaveBeenLastCalledWith(uuid);
    });

    it('Should validate and strip response', async () => {
      const ingredient = {
        id: randomUUID(),
        name: 'a',
        description: 'a',
        alcoholic: false,
        imagePath: null,
      };

      ingredientsSerivce.find.mockResolvedValue({
        junk: 1,
      });
      await request(app.getHttpServer())
        .get(`/ingredients/${ingredient.id}`)
        .expect(500);
      expect(ingredientsSerivce.find).toHaveBeenCalledOnce();
      expect(ingredientsSerivce.find).toHaveBeenLastCalledWith(ingredient.id);

      ingredientsSerivce.find.mockResolvedValue({
        ...ingredient,
        junk: 1,
      });
      await request(app.getHttpServer())
        .get(`/ingredients/${ingredient.id}`)
        .expect(200)
        .expect(ingredient);
      expect(ingredientsSerivce.find).toHaveBeenCalledTimes(2);
      expect(ingredientsSerivce.find).toHaveBeenLastCalledWith(ingredient.id);
    });
  });

  describe('/ingredients/:id (DELETE)', () => {
    it('Should reject invalid uuid', async () => {
      await request(app.getHttpServer()).delete('/ingredients/a').expect(400);

      expect(ingredientsSerivce.remove).not.toHaveBeenCalled();
    });

    it('Should check if the ingredient exists.', async () => {
      const uuid = randomUUID();
      ingredientsSerivce.remove.mockResolvedValue(false);
      await request(app.getHttpServer())
        .delete(`/ingredients/${uuid}`)
        .expect(404);
      expect(ingredientsSerivce.remove).toHaveBeenCalledOnce();
      expect(ingredientsSerivce.remove).toHaveBeenLastCalledWith(uuid);

      ingredientsSerivce.remove.mockResolvedValue(true);
      await request(app.getHttpServer())
        .delete(`/ingredients/${uuid}`)
        .expect(200);
      expect(ingredientsSerivce.remove).toHaveBeenCalledTimes(2);
      expect(ingredientsSerivce.remove).toHaveBeenLastCalledWith(uuid);
    });
  });

  describe('/ingredients/:id (PATCH)', () => {
    const ingredient = {
      id: randomUUID(),
      name: 'a',
      description: 'a',
      alcoholic: false,
      imagePath: null,
    };

    it.each([
      { case: 'empty name', body: { name: '' } },
      { case: 'non-string name', body: { name: 1 } },
      {
        case: 'empty description',
        body: { description: '' },
      },
      {
        case: 'non-string description',
        body: { description: 1 },
      },
      {
        case: 'non-boolean alcoholic',
        body: { alcoholic: 'true' },
      },
      { case: 'id', body: { id: randomUUID() } },
      {
        case: 'imagePath',
        body: { imagePath: 'http://localhost:3000' },
      },
    ])('Should reject $case', async ({ body }) => {
      await request(app.getHttpServer())
        .patch(`/ingredients/${randomUUID()}`)
        .send(body)
        .expect(400);
      expect(ingredientsSerivce.update).not.toHaveBeenCalled();
    });

    const baseBody = { name: 'a', description: 'b' };
    it('Should check if the ingredient exists.', async () => {
      ingredientsSerivce.update.mockResolvedValue(null);
      await request(app.getHttpServer())
        .patch(`/ingredients/${ingredient.id}`)
        .send(baseBody)
        .expect(404);
      expect(ingredientsSerivce.update).toHaveBeenCalledOnce();
      expect(ingredientsSerivce.update).toHaveBeenLastCalledWith(
        ingredient.id,
        baseBody,
      );
    });

    it('Should validate and strip response', async () => {
      ingredientsSerivce.update.mockResolvedValue({
        junk: 1,
      });
      await request(app.getHttpServer())
        .patch(`/ingredients/${ingredient.id}`)
        .send(baseBody)
        .expect(500);
      expect(ingredientsSerivce.update).toHaveBeenCalledOnce();
      expect(ingredientsSerivce.update).toHaveBeenLastCalledWith(
        ingredient.id,
        baseBody,
      );

      ingredientsSerivce.update.mockResolvedValue({
        ...ingredient,
        junk: 1,
      });
      await request(app.getHttpServer())
        .patch(`/ingredients/${ingredient.id}`)
        .send(baseBody)
        .expect(200)
        .expect(ingredient);
      expect(ingredientsSerivce.update).toHaveBeenCalledTimes(2);
      expect(ingredientsSerivce.update).toHaveBeenLastCalledWith(
        ingredient.id,
        baseBody,
      );
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
