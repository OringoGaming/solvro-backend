import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource, EntityManager } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { CocktailCategoryResposeDto } from '../src/categories/dto/cocktailCategoryResponse.dto.js';
import { CocktailResponseDto } from '../src/cocktails/dto/cocktailResponse.dto.js';
import { Cocktail } from '../src/entities/cocktail.entity.js';
import { CocktailCategory } from '../src/entities/cocktailCategory.entity.js';
import { IngredientUnit } from '../src/entities/cocktailIngredient.entity.js';
import { Ingredient } from '../src/entities/ingredient.entity.js';
import { UserRole } from '../src/entities/user.entity.js';
import { IngredientResponseDto } from '../src/ingredients/dto/ingredientResponse.dto.js';
import { UsersService } from '../src/users/users.service.js';

export let MOCK_CATEGORIES: CocktailCategoryResposeDto[];
export let MOCK_UNUSED_CATEGORY: CocktailCategoryResposeDto;
export let MOCK_USED_CATEGORY: CocktailCategoryResposeDto;
export let MOCK_INGREDIENTS: IngredientResponseDto[];
export let MOCK_UNUSED_INGREDIENT: IngredientResponseDto;
export let MOCK_USED_INGREDIENT: IngredientResponseDto;
export let MOCK_COCKTAILS: CocktailResponseDto[];

async function signIn(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<string> {
  const { body } = await request(app.getHttpServer())
    .post('/auth/token')
    .send({ email, password })
    .expect(200);
  return body.accessToken as string;
}

export async function signInAdmin(app: INestApplication<App>): Promise<string> {
  return signIn(app, 'admin@example.com', 'test');
}

export async function signInUser(app: INestApplication<App>): Promise<string> {
  return signIn(app, 'user@example.com', 'test');
}

export async function setupApp(): Promise<INestApplication<App>> {
  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  let app = testingModule.createNestApplication();
  await app.init();
  await app.get(DataSource).synchronize();

  const userService = app.get(UsersService);
  await userService.create(
    { email: 'admin@example.com', role: UserRole.ADMIN },
    'test',
  );
  const user = await userService.create(
    { email: 'user@example.com', role: UserRole.USER },
    'test',
  );
  const user1 = await userService.create(
    { email: 'user1@example.com', role: UserRole.USER },
    'test',
  );

  const mgr = app.get(EntityManager);
  const categories = await mgr.save(CocktailCategory, [
    { name: 'Other' },
    { name: 'Test' },
  ]);
  MOCK_CATEGORIES = categories.map((c) => {
    return { id: c.id, name: c.name };
  });
  [MOCK_UNUSED_CATEGORY, MOCK_USED_CATEGORY] = MOCK_CATEGORIES;

  const ingredients = await mgr.save(Ingredient, [
    { name: 'Gin', description: 'Juniper flavoured spirit.', alcoholic: true },
    { name: 'Vodka', description: 'Clear distilled spirit.', alcoholic: true },
    {
      name: 'Lime juice',
      description: 'Freshly squeezed lime juice.',
      alcoholic: false,
    },
    { name: 'Soda water', description: 'Carbonated water.', alcoholic: false },
  ]);
  MOCK_INGREDIENTS = ingredients.map((i) => {
    return {
      id: i.id,
      name: i.name,
      description: i.description,
      alcoholic: i.alcoholic,
    };
  });
  [MOCK_UNUSED_INGREDIENT, MOCK_USED_INGREDIENT] = MOCK_INGREDIENTS;

  await mgr.save(
    Cocktail,
    mgr.create(Cocktail, [
      {
        name: 'Vodka Lime',
        instruction: 'Shake vodka with lime juice and ice.',
        categoryId: MOCK_USED_CATEGORY.id,
        userId: user.id,
        cocktailIngredients: [
          {
            ingredientId: MOCK_USED_INGREDIENT.id,
            unit: IngredientUnit.ML,
            amount: '40',
          },
          {
            ingredientId: MOCK_INGREDIENTS[2].id,
            unit: IngredientUnit.ML,
            amount: '20',
          },
        ],
      },
      {
        name: 'Lime Soda',
        instruction: 'Top lime juice with soda water.',
        categoryId: MOCK_USED_CATEGORY.id,
        userId: user1.id,
        cocktailIngredients: [
          {
            ingredientId: MOCK_INGREDIENTS[2].id,
            unit: IngredientUnit.ML,
            amount: '20',
          },
          {
            ingredientId: MOCK_INGREDIENTS[3].id,
            unit: IngredientUnit.ML,
            amount: '150',
          },
        ],
      },
    ]),
  );
  MOCK_COCKTAILS = (
    await mgr.find(Cocktail, {
      relations: {
        category: true,
        cocktailIngredients: { ingredient: true },
        user: true,
      },
    })
  ).map((c) => {
    return {
      id: c.id,
      name: c.name,
      instruction: c.instruction,
      category: { id: c.category.id, name: c.category.name },
      ingredients: c.cocktailIngredients.map((ci) => {
        return {
          id: ci.ingredientId,
          name: ci.ingredient.name,
          description: ci.ingredient.description,
          alcoholic: ci.ingredient.alcoholic,
          unit: ci.unit,
          amount: parseFloat(ci.amount),
        };
      }),
      user: { id: c.userId, email: c.user.email },
    };
  });

  return app;
}
