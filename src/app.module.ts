import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CocktailsModule } from './cocktails/cocktails.module.js';
import { Cocktail } from './entities/cocktail.entity.js';
import { CocktailIngredient } from './entities/cocktailIngredient.entity.js';
import { Ingredient } from './entities/ingredient.entity.js';
import { CocktailCategory } from './entities/cocktailCategory.entity.js';
import { IngredientsModule } from './ingredients/ingredients.module.js';

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432');
const username = process.env.DB_USERNAME || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres';
const database = process.env.DB_DATABASE || 'backend';

@Module({
  imports: [
    CocktailsModule,
    IngredientsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [Cocktail, CocktailIngredient, Ingredient, CocktailCategory],
      synchronize: false,
    }),
  ],
})
export class AppModule {}
