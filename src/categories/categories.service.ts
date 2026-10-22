import { ConflictException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { FK_COCKTAIL_CATEGORY } from '../entities/cocktail.entity.js';
import {
  COCKTAIL_CATEGORY_UNIQUE_NAME,
  CocktailCategory,
} from '../entities/cocktailCategory.entity.js';
import { isConstraintError, PgErrorCode } from '../shared/utils/dbErrors.js';

export type CocktailCategoryInput = Partial<
  Omit<CocktailCategory, 'id' | 'cocktails'>
>;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findCategories(): Promise<CocktailCategory[]> {
    return await this.entityManager.find(CocktailCategory);
  }

  async createCategory(
    input: CocktailCategoryInput,
  ): Promise<CocktailCategory> {
    try {
      return await this.entityManager.save(CocktailCategory, input);
    } catch (e) {
      if (
        isConstraintError(
          e,
          PgErrorCode.UNIQUE_VIOLATION,
          COCKTAIL_CATEGORY_UNIQUE_NAME,
        )
      )
        throw new ConflictException('Category name is taken.');
      throw e;
    }
  }

  async updateCategory(
    id: number,
    input: CocktailCategoryInput,
  ): Promise<CocktailCategory | null> {
    if (Object.keys(input).length === 0)
      return await this.entityManager.findOneBy(CocktailCategory, { id });
    try {
      const result = await this.entityManager.update(
        CocktailCategory,
        id,
        input,
        { returning: '*' },
      );
      if (result.affected === 0) return null;
      return result.raw[0];
    } catch (e) {
      if (
        isConstraintError(
          e,
          PgErrorCode.UNIQUE_VIOLATION,
          COCKTAIL_CATEGORY_UNIQUE_NAME,
        )
      )
        throw new ConflictException('Category name is taken.');
      throw e;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await this.entityManager.delete(CocktailCategory, { id });
      return result.affected !== 0;
    } catch (e) {
      if (
        isConstraintError(
          e,
          PgErrorCode.RESTRICT_VIOLATION,
          FK_COCKTAIL_CATEGORY,
        )
      )
        throw new ConflictException('Cocktail category is in use.');
      throw e;
    }
  }
}
