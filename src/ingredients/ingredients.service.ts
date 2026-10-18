import { ConflictException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { COCKTAIL_INGREDIENT_INGREDIENT_FK } from '../entities/cocktailIngredient.entity.js';
import {
  Ingredient,
  INGREDIENT_UNIQUE_NAME,
} from '../entities/ingredient.entity.js';
import {
  FK_INGREDIENT_IMAGE,
  IngredientImage,
} from '../entities/ingredientImage.entity.js';
import { isConstraintError, PgErrorCode } from '../shared/utils/dbErrors.js';

export interface IngredientsPage {
  ingredients: Ingredient[];
  total: number;
}
export type IngredientInput = Partial<
  Omit<Ingredient, 'id' | 'cocktailIngredients' | 'image'>
>;

export interface IngredientsFilter {
  take: number;
  skip: number;
  name?: string;
  description?: string;
  alcoholic?: boolean;
  sort?: ('name' | 'alcoholic')[];
  sortDir?: 'ASC' | 'DESC';
}

export type ImageInput = Omit<
  IngredientImage,
  'id' | 'ingredientId' | 'ingredient'
>;

function assertSort(sort?: string) {
  if (sort !== undefined && sort !== 'name' && sort !== 'alcoholic')
    throw new Error(
      `Sort must be 'name', 'alcoholic' or undefined. Is ${sort}.`,
    );
}

function assertSortDir(sortDir?: string) {
  if (sortDir !== undefined && sortDir !== 'ASC' && sortDir !== 'DESC')
    throw new Error(
      `Sort direction must be 'ASC', 'DESC' or undefined. Is ${sortDir}.`,
    );
}

function toNameConflict(error: unknown): unknown {
  if (
    !isConstraintError(
      error,
      PgErrorCode.UNIQUE_VIOLATION,
      INGREDIENT_UNIQUE_NAME,
    )
  )
    return error;
  return new ConflictException('Ingredient name is taken.');
}

@Injectable()
export class IngredientsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findPaginated({
    take,
    skip,
    name,
    description,
    sortDir,
    alcoholic,
    sort,
  }: IngredientsFilter): Promise<IngredientsPage> {
    const query = this.entityManager
      .createQueryBuilder(Ingredient, 'ingredient')
      .take(take)
      .skip(skip);
    if (name)
      query.andWhere("ingredient.name ILIKE '%' || :name || '%'", {
        name,
      });
    if (description)
      query.andWhere(
        "ingredient.description ILIKE '%' || :description || '%'",
        {
          description,
        },
      );
    if (alcoholic !== undefined)
      query.andWhere('ingredient.alcoholic = :alcoholic', {
        alcoholic,
      });

    assertSortDir(sortDir);
    sort?.forEach((v) => {
      assertSort(v);
      query.addOrderBy(`ingredient.${v}`, sortDir);
    });
    query.addOrderBy('ingredient.id', sortDir);

    const result = await query.getManyAndCount();
    return { ingredients: result[0], total: result[1] };
  }

  find(id: string): Promise<Ingredient | null> {
    return this.entityManager.findOneBy(Ingredient, { id });
  }

  async remove(id: string): Promise<boolean> {
    try {
      const res = await this.entityManager.delete(Ingredient, { id });
      return res.affected !== 0;
    } catch (e) {
      if (
        !isConstraintError(
          e,
          PgErrorCode.RESTRICT_VIOLATION,
          COCKTAIL_INGREDIENT_INGREDIENT_FK,
        )
      )
        throw e;
      throw new ConflictException('The ingredient is still in use.');
    }
  }

  async create(ingredient: IngredientInput): Promise<Ingredient> {
    const created = this.entityManager.create(Ingredient, ingredient);
    try {
      return await this.entityManager.save(Ingredient, created);
    } catch (e) {
      throw toNameConflict(e);
    }
  }

  async update(
    id: string,
    ingredient: IngredientInput,
  ): Promise<Ingredient | null> {
    try {
      const res = await this.entityManager.update(
        Ingredient,
        { id },
        ingredient,
        {
          returning: '*',
        },
      );
      if (!res.affected) return null;

      // less db round trips
      return res.raw[0];
    } catch (e) {
      throw toNameConflict(e);
    }
  }

  /**
   * Create the image or delete if undefined.
   * @param id the id of the ingredient
   * @param image the image or undefined to delete.
   * @returns True if the image is defined and the ingredient exists or the image is undefined and the ingredient exists and has an image.
   */
  async updateImage(id: string, image?: ImageInput): Promise<boolean> {
    if (!image) {
      const result = await this.entityManager.delete(IngredientImage, {
        ingredientId: id,
      });
      return result.affected !== 0;
    }

    try {
      await this.entityManager.upsert(
        IngredientImage,
        { ...image, ingredientId: id },
        {
          conflictPaths: { ingredientId: true },
        },
      );
    } catch (e) {
      if (
        !isConstraintError(
          e,
          PgErrorCode.FOREIGN_KEY_VIOLATION,
          FK_INGREDIENT_IMAGE,
        )
      )
        throw e;
      return false;
    }
    return true;
  }

  async findImage(id: string): Promise<IngredientImage | null> {
    return await this.entityManager.findOneBy(IngredientImage, {
      ingredientId: id,
    });
  }
}
