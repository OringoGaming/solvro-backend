import { Module } from '@nestjs/common';
import { IngredientsController } from './ingredients.controller.js';
import { IngredientsPolicy } from './ingredients.policy.js';
import { IngredientsService } from './ingredients.service.js';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService, IngredientsPolicy],
})
export class IngredientsModule {}
