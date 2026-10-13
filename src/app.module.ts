import {
  Module,
  StandardSchemaSerializerInterceptor,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { CocktailsModule } from './cocktails/cocktails.module.js';
import { Cocktail } from './entities/cocktail.entity.js';
import { CocktailIngredient } from './entities/cocktailIngredient.entity.js';
import { Ingredient } from './entities/ingredient.entity.js';
import { CocktailCategory } from './entities/cocktailCategory.entity.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
// import { AuthenticationModule } from '@nestjs/authentication';
// import { ConstraintErrorInterceptor } from './shared/constraintError.interceptor.js';
import { ConfigModule } from '@nestjs/config';


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
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ConstraintErrorInterceptor,
    // },
  ],
  imports: [
    ConfigModule.forRoot(),
    // AuthenticationModule.forRoot({
    //   accessToken: {
    //     key: process.env.JWT_SECRET!,
    //     issuer: 'backend',
    //     ttl: '15m',
    //   },
    // }),
    // AuthModule,
    //CocktailsModule,
    IngredientsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      entities: [Cocktail, CocktailIngredient, Ingredient, CocktailCategory],
      synchronize: false,
    }),
  ],
})
export class AppModule {}
