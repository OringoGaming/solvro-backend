import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { EntityManager } from 'typeorm';
import { CocktailResponseDto } from '../src/cocktails/dto/cocktailResponse.dto.js';
import {
  CocktailIngredient,
  IngredientUnit,
} from '../src/entities/cocktailIngredient.entity.js';
import {
  MOCK_COCKTAILS,
  MOCK_INGREDIENTS,
  MOCK_UNUSED_CATEGORY,
  MOCK_UNUSED_INGREDIENT,
  MOCK_USED_CATEGORY,
  MOCK_USED_INGREDIENT,
  setupApp,
  signInAdmin,
  signInUser1,
  USER1,
  USER1_COCKTAIL,
  USER2_COCKTAIL,
} from './appUtils.js';

describe('Cocktails', async () => {
  let app: INestApplication<App>;

  beforeEach(async () => (app = await setupApp()));
  afterAll(async () => await app.close());

  describe('/cocktails (GET)', async () => {
    it('Validates input', async () => {
      const expect400 = async (query: string) => {
        await request(app.getHttpServer())
          .get(`/cocktails?${query}`)
          .expect(400);
      };

      await expect400('');
      await expect400('page=a');
      await expect400('page=-1');
      await expect400('page=0&pageSize=0');
      await expect400('junk=1&page=0');
      await expect400('page=0&sort=aaaa');
      await expect400('page=0&sort=name&sort=name');
      await expect400('page=0&sortDir=aaa');
      await expect400('page=0&ingredietnIds=aa');
      await expect400('page=0&userId=aa');
    });

    it('Filters', async () => {
      const expectFiltered = async (
        query: string,
        expectedList: CocktailResponseDto[],
      ) => {
        expect(expectedList.length).not.toBe(0);

        await request(app.getHttpServer())
          .get(`/cocktails?page=0&${query}`)
          .expect(200)
          .expect((resp) => {
            for (const element of resp.body.cocktails) {
              expect(expectedList).toContainEqual(element);
            }
            expect(resp.body.cocktails.length).toEqual(expectedList.length);
          });
      };

      await expectFiltered('name=LIME', MOCK_COCKTAILS);
      await expectFiltered(
        'alcoholic=false',
        MOCK_COCKTAILS.filter((c) => !c.ingredients.find((i) => i.alcoholic)),
      );
      await expectFiltered(
        'alcoholic=true',
        MOCK_COCKTAILS.filter((c) => c.ingredients.find((i) => i.alcoholic)),
      );
      await expectFiltered(`userId=${USER1.id}`, [USER1_COCKTAIL]);
      await expectFiltered(
        `ingredientIds=${MOCK_USED_INGREDIENT.id}`,
        MOCK_COCKTAILS.filter((c) =>
          c.ingredients.find((f) => f.id === MOCK_USED_INGREDIENT.id),
        ),
      );
      await expectFiltered(
        `ingredientIds=${MOCK_INGREDIENTS[2].id}&ingredientIds=${MOCK_INGREDIENTS[3].id}`,
        [MOCK_COCKTAILS[1]],
      );
      await expectFiltered(
        `categoryIds=${MOCK_UNUSED_CATEGORY.id}&categoryIds=${MOCK_USED_CATEGORY.id}`,
        MOCK_COCKTAILS,
      );
    });

    it('Sorts', async () => {
      const expectSorted = async (
        query: string,
        compare: (a: CocktailResponseDto, b: CocktailResponseDto) => number,
      ) => {
        await request(app.getHttpServer())
          .get(`/cocktails?page=0&${query}`)
          .expect(200)
          .expect((resp) => {
            const cocktails: CocktailResponseDto[] = resp.body.cocktails;
            expect(cocktails.length).toBe(MOCK_COCKTAILS.length);
            for (const i of MOCK_COCKTAILS) {
              expect(cocktails).toContainEqual(i);
            }
            for (let i = 1; i < cocktails.length; i++) {
              const order = compare(cocktails[i - 1], cocktails[i]);
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

  describe('/cocktails (POST)', async () => {
    it('Requires auth', async () => {
      await request(app.getHttpServer())
        .post(`/cocktails`)
        .send({
          name: 'test',
          instruction: 'test',
          categoryId: MOCK_UNUSED_CATEGORY.id,
          ingredients: [
            {
              id: MOCK_UNUSED_INGREDIENT.id,
              amount: 20,
              unit: IngredientUnit.ML,
            },
          ],
        })
        .expect(401);
    });

    it('Validates input', async () => {
      const expect400 = async (body: any) => {
        const token = await signInUser1(app);

        await request(app.getHttpServer())
          .post(`/cocktails`)
          .auth(token, { type: 'bearer' })
          .send(body)
          .expect(400);
      };
      await expect400({});
      await expect400({
        name: 'test',
        instruction: 'test',
        categoryId: MOCK_UNUSED_CATEGORY.id,
        ingredients: [
          {
            id: MOCK_UNUSED_INGREDIENT.id,
            amount: 20,
            unit: IngredientUnit.ML,
          },
          {
            id: MOCK_UNUSED_INGREDIENT.id,
            amount: 20,
            unit: IngredientUnit.ML,
          },
        ],
      });
      await expect400({
        name: '',
        instruction: 'test',
        categoryId: MOCK_UNUSED_CATEGORY.id,
        ingredients: [],
      });
    });

    it('Returns 409 for used name', async () => {
      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .post(`/cocktails`)
        .auth(token, { type: 'bearer' })
        .send({
          name: MOCK_COCKTAILS[0].name,
          instruction: 'test',
          categoryId: MOCK_UNUSED_CATEGORY.id,
          ingredients: [],
        })
        .expect(409);
    });

    it('Returns 409 for unknwon category or ingredient', async () => {
      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .post(`/cocktails`)
        .auth(token, { type: 'bearer' })
        .send({
          name: MOCK_COCKTAILS[0].name,
          instruction: 'test',
          categoryId: -1,
          ingredients: [],
        })
        .expect(409);

      await request(app.getHttpServer())
        .post(`/cocktails`)
        .auth(token, { type: 'bearer' })
        .send({
          name: MOCK_COCKTAILS[0].name,
          instruction: 'test',
          categoryId: -1,
          ingredients: [
            {
              id: '00000000-0000-0000-0000-000000000000',
              unit: IngredientUnit.OTHER,
              amount: 1,
            },
          ],
        })
        .expect(409);
    });

    it('Creates', async () => {
      const token = await signInUser1(app);
      const res = await request(app.getHttpServer())
        .post(`/cocktails`)
        .auth(token, { type: 'bearer' })
        .send({
          name: 'test',
          instruction: 'test1',
          categoryId: MOCK_UNUSED_CATEGORY.id,
          ingredients: MOCK_INGREDIENTS.map((i) => {
            return {
              id: i.id,
              unit: IngredientUnit.OTHER,
              amount: 1,
            };
          }),
        })
        .expect(201)
        .expect((resp) => {
          expect(resp.body.user).toEqual({ id: USER1.id, email: USER1.email });
          expect(resp.body.name).toBe('test');
          expect(resp.body.instruction).toBe('test1');
          expect(resp.body.category).toEqual(MOCK_UNUSED_CATEGORY);

          expect(resp.body.ingredients.length).toBe(MOCK_INGREDIENTS.length);
          for (const ingredient of MOCK_INGREDIENTS) {
            expect(resp.body.ingredients).toContainEqual({
              id: ingredient.id,
              description: ingredient.description,
              name: ingredient.name,
              unit: IngredientUnit.OTHER,
              amount: 1,
              alcoholic: ingredient.alcoholic,
            });
          }
        });

      await request(app.getHttpServer())
        .get(`/cocktails/${res.body.id}`)
        .expect(200)
        .expect({
          id: res.body.id,
          name: 'test',
          instruction: 'test1',
          category: MOCK_UNUSED_CATEGORY,
          user: { id: USER1.id, email: USER1.email },
          ingredients: MOCK_INGREDIENTS.map((ingredient) => {
            return {
              id: ingredient.id,
              description: ingredient.description,
              name: ingredient.name,
              unit: IngredientUnit.OTHER,
              amount: 1,
              alcoholic: ingredient.alcoholic,
            };
          }),
        });
    });
  });

  describe('/cocktails/:id (GET)', async () => {
    it('Validates input', async () => {
      await request(app.getHttpServer()).get('/cocktails/aaa').expect(400);
    });

    it('Returns 404 for unknown cocktail', async () => {
      await request(app.getHttpServer())
        .get('/cocktails/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('Returns the cocktail', async () => {
      await request(app.getHttpServer())
        .get(`/cocktails/${MOCK_COCKTAILS[1].id}`)
        .expect(200)
        .expect(MOCK_COCKTAILS[1]);
    });
  });

  describe('/cocktails/:id (PATCH)', async () => {
    it('Requires author or admin.', async () => {
      await request(app.getHttpServer())
        .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .send({})
        .expect(401);

      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .patch(`/cocktails/${USER2_COCKTAIL.id}`)
        .auth(token, { type: 'bearer' })
        .send({})
        .expect(403);

      const admin = await signInAdmin(app);
      await request(app.getHttpServer())
        .patch(`/cocktails/${USER2_COCKTAIL.id}`)
        .auth(admin, { type: 'bearer' })
        .send({})
        .expect(200);
    });

    it('Validates input', async () => {
      const expect400 = async (body: any) => {
        const token = await signInUser1(app);

        await request(app.getHttpServer())
          .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
          .auth(token, { type: 'bearer' })
          .send(body)
          .expect(400);
      };
      await expect400({
        ingredients: [
          {
            id: MOCK_UNUSED_INGREDIENT.id,
            amount: 20,
            unit: IngredientUnit.ML,
          },
          {
            id: MOCK_UNUSED_INGREDIENT.id,
            amount: 20,
            unit: IngredientUnit.ML,
          },
        ],
      });
      await expect400({
        name: '',
        ingredients: [],
      });
      await expect400({
        name: 'test',
        junk: 'a',
      });
    });

    it('Returns 409 for used name', async () => {
      const token = await signInUser1(app);

      await request(app.getHttpServer())
        .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({ name: MOCK_COCKTAILS[1].name })
        .expect(409);
    });

    it('Returns 409 for unknwon category or ingredient', async () => {
      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({
          categoryId: -1,
        })
        .expect(409);

      await request(app.getHttpServer())
        .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({
          ingredients: [
            {
              id: '00000000-0000-0000-0000-000000000000',
              unit: IngredientUnit.OTHER,
              amount: 1,
            },
          ],
        })
        .expect(409);
    });

    it('Updates', async () => {
      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({
          name: 'test',
          ingredients: [],
        })
        .expect(200)
        .expect({
          ...MOCK_COCKTAILS[0],
          name: 'test',
          ingredients: [],
        });

      await request(app.getHttpServer())
        .patch(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .auth(token, { type: 'bearer' })
        .send({
          name: 'test',
          ingredients: [
            {
              id: MOCK_USED_INGREDIENT.id,
              unit: IngredientUnit.ML,
              amount: 1,
            },
          ],
        })
        .expect(200)
        .expect({
          ...MOCK_COCKTAILS[0],
          name: 'test',
          ingredients: [
            {
              ...MOCK_USED_INGREDIENT,
              unit: IngredientUnit.ML,
              amount: 1,
            },
          ],
        });

      const count = await app
        .get(EntityManager)
        .countBy(CocktailIngredient, {
          ingredientId: MOCK_USED_INGREDIENT.id,
        });
      // Check if orphans are deleted
      expect(count).toBe(1);
    });
  });

  describe('/cocktails/:id (DELETE)', async () => {
    it('Requires author or admin', async () => {
      await request(app.getHttpServer())
        .delete(`/cocktails/${MOCK_COCKTAILS[0].id}`)
        .expect(401);

      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .delete(`/cocktails/${USER2_COCKTAIL.id}`)
        .auth(token, { type: 'bearer' })
        .expect(403);

      const admin = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete(`/cocktails/${USER2_COCKTAIL.id}`)
        .auth(admin, { type: 'bearer' })
        .expect(204);
    });

    it('Validates input', async () => {
      const admin = await signInAdmin(app);
      await request(app.getHttpServer())
        .delete('/cocktails/aaaa')
        .auth(admin, { type: 'bearer' })
        .expect(400);
    });

    it('Deletes', async () => {
      const token = await signInUser1(app);
      await request(app.getHttpServer())
        .delete(`/cocktails/${USER1_COCKTAIL.id}`)
        .auth(token, { type: 'bearer' })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/cocktails/${USER1_COCKTAIL.id}`)
        .expect(404);

      const mgr = app.get(EntityManager);
      //check cascade
      expect(
        !(await mgr.existsBy(CocktailIngredient, {
          cocktailId: USER1_COCKTAIL.id,
        })),
      );
    });
  });
});
