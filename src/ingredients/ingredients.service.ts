import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  Entity,
  EntityManager,
  Equal,
  ILike,
  Like,
  QueryFailedError,
} from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity.js';
import { InjectEntityManager } from '@nestjs/typeorm';
import { IngredientImage } from '../entities/ingredientImage.entity.js';
import { de } from 'zod/locales';

export type IngredientsPage = { ingredients: Ingredient[]; total: number };
export type IngredientInput = Partial<
  Omit<Ingredient, 'id' | 'cocktailIngredients' | 'image'>
>;

export type IngredientsFilter = {
  take: number;
  skip: number;
  name?: string;
  description?: string;
  alcoholic?: boolean;
  sort?: ('name' | 'alcoholic')[];
  sortDir?: 'ASC' | 'DESC';
};

export type ImageInput = Omit<
  IngredientImage,
  'id' | 'ingredientId' | 'ingredient'
>;

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
    let query = this.entityManager
      .createQueryBuilder(Ingredient, 'ingredient')
      .take(take)
      .skip(skip);
    if (name)
      query = query.andWhere("ingredient.name ILIKE '%' || :name || '%'", {
        name,
      });
    if (description)
      query = query.andWhere("ingredient.description ILIKE '%' || :description || '%'", {
        description,
      });
    if (alcoholic !== undefined)
      query = query.andWhere('ingredient.alcoholic = :alcoholic', {
        alcoholic,
      });

    sort?.forEach((v) => {
      // prevent injection.
      query = query.addOrderBy(
        v === 'name' ? 'ingredient.name' : 'ingredient.alcoholic', sortDir
      );
    });
    query = query.addOrderBy('ingredient.id', sortDir);

    const result = await query.getManyAndCount();
    return { ingredients: result[0], total: result[1] };
  }

  find(id: string): Promise<Ingredient | null> {
    return this.entityManager.findOneBy(Ingredient, { id });
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.entityManager.delete(Ingredient, { id });
    return res.affected ? true : false;
  }

  async create(ingredient: IngredientInput): Promise<Ingredient> {
    const created = this.entityManager.create(Ingredient, ingredient);
    return await this.entityManager.save(Ingredient, created);
  }

  async update(
    id: string,
    ingredient: IngredientInput,
  ): Promise<Ingredient | null> {
    const res = await this.entityManager.update(
      Ingredient,
      { id },
      ingredient,
      { returning: '*' },
    );
    if (!res.affected) return null;
    // less db round trips
    return res.raw[0];
  }

  /**
   * 
   * @param id the id of the ingredient
   * @param image the image or undefined to delete.
   * @returns True if the image is defined and the 
   */
  async updateImage(id: string, image?: ImageInput): Promise<boolean> {
    if (!image) {
      const result = await this.entityManager.delete(IngredientImage, {
        ingredientId: id
      });
      return result.affected !== 0;
    }

    //TODO: try and check constraint
    await this.entityManager.upsert(
      IngredientImage,
      { ...image, ingredientId: id },
      {
        conflictPaths: { ingredientId: true },
      },
    );
    return true;
  }

  async findImage(id: string): Promise<IngredientImage | null> {
    return await this.entityManager.findOneBy(IngredientImage, {
      ingredientId: id
    });
  }
}
