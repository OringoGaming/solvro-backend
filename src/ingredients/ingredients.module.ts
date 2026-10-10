import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientsService } from './ingredients.service.js';
import { IngredientsController } from './ingredients.controller.js';
import { Ingredient } from '../entities/ingredient.entity.js';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService],
  imports: [TypeOrmModule.forFeature([Ingredient])],
})
export class IngredientsModule {}
