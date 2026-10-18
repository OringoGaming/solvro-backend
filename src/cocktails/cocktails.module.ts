import { Module } from '@nestjs/common';
import { CocktailsController } from './cocktails.controller.js';
import { CocktailsPolicy } from './cocktails.policy.js';
import { CocktailsService } from './cocktails.service.js';

@Module({
  controllers: [CocktailsController],
  providers: [CocktailsService, CocktailsPolicy],
})
export class CocktailsModule {}
