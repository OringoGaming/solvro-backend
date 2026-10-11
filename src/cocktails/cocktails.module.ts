import { Module } from '@nestjs/common';
import { CocktailsService } from './cocktails.service.js';
import { CocktailsController } from './cocktails.controller.js';

@Module({
  controllers: [CocktailsController],
  providers: [CocktailsService],
})
export class CocktailsModule {}
