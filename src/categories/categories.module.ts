import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesPolicy } from './categories.policy.js';
import { CategoriesService } from './categories.service.js';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesPolicy],
})
export class CategoriesModule {}
