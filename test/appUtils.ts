import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { DataSource, EntityManager } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { CocktailCategoryResposeDto } from '../src/categories/dto/cocktailCategoryResponse.dto.js';
import { CocktailCategory } from '../src/entities/cocktailCategory.entity.js';
import { UserRole } from '../src/entities/user.entity.js';
import { UsersService } from '../src/users/users.service.js';

export let MOCK_CATEGORIES: CocktailCategoryResposeDto[];

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
  await userService.create(
    { email: 'user@example.com', role: UserRole.USER },
    'test',
  );
  await userService.create(
    { email: 'user1@example.com', role: UserRole.USER },
    'test',
  );

  const mgr = app.get(EntityManager);
  await mgr.insert(CocktailCategory, [{ name: 'Other' }, { name: 'Test' }]);
  MOCK_CATEGORIES = (await mgr.find(CocktailCategory)).map((c) => {
    return { id: c.id, name: c.name };
  });

  return app;
}
