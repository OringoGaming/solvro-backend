import { AuthenticationModule } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import {
  Module,
  StandardSchemaSerializerInterceptor,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CocktailsModule } from './cocktails/cocktails.module.js';
import { Cocktail } from './entities/cocktail.entity.js';
import { CocktailCategory } from './entities/cocktailCategory.entity.js';
import { CocktailIngredient } from './entities/cocktailIngredient.entity.js';
import { Ingredient } from './entities/ingredient.entity.js';
import { IngredientImage } from './entities/ingredientImage.entity.js';
import { User } from './entities/user.entity.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { SeedModule } from './seed/seed.module.js';
import { isTest } from './shared/utils/utils.js';

@Module({
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
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: isTest()
    }),
    AuthenticationModule.forRootAsync({
      useFactory() {
        return {
          accessToken: {
            key: process.env.JWT_SECRET!,
            issuer: 'cocktails',
            ttl: '15m',
          },
        };
      },
    }),
    AuthorizationModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory() {
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT!),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          entities: [
            Cocktail,
            CocktailIngredient,
            Ingredient,
            CocktailCategory,
            User,
            IngredientImage,
          ],
          synchronize: false,
        };
      },
    }),
    AuthModule,
    CocktailsModule,
    IngredientsModule,
    SeedModule,
    CategoriesModule,
  ],
})
export class AppModule {}
