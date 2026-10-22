import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { CreateIngredientDto } from '../src/ingredients/dto/createIngredient.dto.js';
import { IngredientResponseDto } from '../src/ingredients/dto/ingredientResponse.dto.js';
import {
  MOCK_INGREDIENTS,
  MOCK_USED_INGREDIENT,
  setupApp,
  signInAdmin,
  signInUser,
} from './appUtils.js';

describe('Ingredients', async () => {
  let app: INestApplication<App>;

  beforeEach(async () => (app = await setupApp()));
  afterAll(async () => await app.close());

  describe('/ingredients (GET)', async () => {
    it('Validates input', async () => {
      const expect400 = async (query: string) => {
        await request(app.getHttpServer())
          .get(`/ingredients?${query}`)
          .expect(400);
      };

      await expect400('');
      await expect400('page=0&pageSize=a');
      await expect400('page=0&sortDir=a');
      await expect400('page=0&sort=a');
      await expect400('page=0&sort=name&sort=name');
    });

    it('Filters', async () => {
      const expectIngredients = async (
        query: string,
        ingredients: IngredientResponseDto[],
      ) => {
        await request(app.getHttpServer())
          .get(`/ingredients?page=0&${query}`)
          .expect(200)
          .expect((resp) => {
            expect(resp.body.ingredients.length).toBe(ingredients.length);
            for (const i of ingredients) {
              expect(resp.body.ingredients).toContainEqual(i);
            }
          });
      };

      await expectIngredients(
        'name=LIME',
        MOCK_INGREDIENTS.filter((i) => i.name.toLowerCase().includes('lime')),
      );
      await expectIngredients(
        'description=SPIRIT',
        MOCK_INGREDIENTS.filter((i) =>
          i.description.toLowerCase().includes('spirit'),
        ),
      );
      await expectIngredients(
        'alcoholic=true',
        MOCK_INGREDIENTS.filter((i) => i.alcoholic),
      );
      await expectIngredients(
        'name=a&alcoholic=false',
        MOCK_INGREDIENTS.filter(
          (i) => i.name.toLowerCase().includes('a') && !i.alcoholic,
        ),
      );
      await expectIngredients('name=aaaaaaaaaaaa', []);
    });

    it('Sorts', async () => {
      const expectSorted = async (
        query: string,
        compare: (a: IngredientResponseDto, b: IngredientResponseDto) => number,
      ) => {
        await request(app.getHttpServer())
          .get(`/ingredients?page=0&${query}`)
          .expect(200)
          .expect((resp) => {
            const ingredients: IngredientResponseDto[] = resp.body.ingredients;
            expect(ingredients.length).toBe(MOCK_INGREDIENTS.length);
            for (const i of MOCK_INGREDIENTS) {
              expect(ingredients).toContainEqual(i);
            }
            for (let i = 1; i < ingredients.length; i++) {
              const order = compare(ingredients[i - 1], ingredients[i]);
              expect(order).toBeLessThanOrEqual(0);
            }
          });
      };

      await expectSorted('sort=name', (a, b) => a.name.localeCompare(b.name));
      await expectSorted('sort=name&sortDir=DESC', (a, b) =>
        b.name.localeCompare(a.name),
      );
    });
  });

  describe('/ingredients (POST)', async () => {
    const validBody: CreateIngredientDto = {
      name: 'test',
      alcoholic: false,
      description: 'test',
    };

    it('Creates', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .post(`/ingredients`)
        .auth(token, { type: 'bearer' })
        .send(validBody)
        .expect(201);
    });

    it('Requires admin.', async () => {
      await request(app.getHttpServer())
        .post(`/ingredients`)
        .send(validBody)
        .expect(401);

      const token = await signInUser(app);
      await request(app.getHttpServer())
        .post(`/ingredients`)
        .auth(token, { type: 'bearer' })
        .send(validBody)
        .expect(403);
    });

    it('Validates input', async () => {
      const expect400 = async (body: any) => {
        const token = await signInAdmin(app);
        await request(app.getHttpServer())
          .post(`/ingredients`)
          .auth(token, { type: 'bearer' })
          .send(body)
          .expect(400);
      };

      await expect400({});
      await expect400({ ...validBody, junk: 1 });
    });

    it('Conflics on name taken', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .post(`/ingredients`)
        .auth(token, { type: 'bearer' })
        .send({
          name: MOCK_INGREDIENTS[0].name,
          alcoholic: false,
          description: 'test',
        })
        .expect(409);
    });
  });

  describe('/ingredients/:id (GET)', async () => {
    it('Returns the ingredient', async () => {
      await request(app.getHttpServer())
        .get(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .expect(200)
        .expect(MOCK_INGREDIENTS[0]);
    });

    it('Throws 404 on wrong id', async () => {
      await request(app.getHttpServer())
        .get(`/ingredients/00000000-0000-0000-0000-000000000000`)
        .expect(404);
    });
  });

  describe('/ingredients/:id (PATCH)', async () => {
    it('Throws 404 on wrong id', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch(`/ingredients/00000000-0000-0000-0000-000000000000`)
        .auth(token, { type: 'bearer' })
        .send({})
        .expect(404);
    });

    it('Requires admin.', async () => {
      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .send({})
        .expect(401);

      const token = await signInUser(app);
      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({})
        .expect(403);
    });

    it('Conflics on name taken', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({
          name: MOCK_INGREDIENTS[1].name,
        })
        .expect(409);
    });

    it('Validates input.', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({ junk: 1 })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({ name: 1 })
        .expect(400);
    });

    it('Updates', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({})
        .expect(200)
        .expect(MOCK_INGREDIENTS[0]);

      await request(app.getHttpServer())
        .patch(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({ name: 'test' })
        .expect(200)
        .expect({ ...MOCK_INGREDIENTS[0], name: 'test' });
    });
  });

  describe('/ingredients/:id (DELETE)', async () => {
    it('Returns 404 for wrong id', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete(`/ingredients/00000000-0000-0000-0000-000000000000`)
        .auth(token, { type: 'bearer' })
        .expect(404);
    });

    it('Validates input', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete(`/ingredients/aaaaa`)
        .auth(token, { type: 'bearer' })
        .expect(400);
    });

    it('Requires admin.', async () => {
      await request(app.getHttpServer())
        .delete(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .expect(401);

      const token = await signInUser(app);
      await request(app.getHttpServer())
        .delete(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .expect(403);
    });

    it('Returns 409 for used ingredient', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete(`/ingredients/${MOCK_USED_INGREDIENT.id}`)
        .auth(token, { type: 'bearer' })
        .expect(409);
    });

    it('Deletes', async () => {
      const token = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete(`/ingredients/${MOCK_INGREDIENTS[0].id}`)
        .auth(token, { type: 'bearer' })
        .expect(204);
    });
  });
});
