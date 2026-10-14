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
import { IngredientImage } from '../entities/file.entity.js';

export type IngredientsPage = { ingredients: Ingredient[]; total: number };
export type IngredientInput = Partial<
  Omit<Ingredient, 'id' | 'cocktailIngredients' | 'image'>
>;

export type IngredientsFilter = {
  name?: string;
  alcoholic?: boolean;
  orderBy?: 'name' | 'alcoholic';
  orderDir?: 'ASC' | 'DESC';
};

@Injectable()
export class IngredientsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findPaginated(
    take: number,
    skip: number,
    filter?: IngredientsFilter,
  ): Promise<IngredientsPage> {
    const orderDir = filter?.orderDir ?? 'ASC';
    const order = filter?.orderBy
      ? filter.orderBy === 'name'
        ? { name: orderDir }
        : { alcoholic: orderDir }
      : undefined;

    const result = await this.entityManager.findAndCount(Ingredient, {
      take,
      skip,
      where: {
        name: filter?.name ? ILike(`%${filter.name}`) : undefined,
        alcoholic: filter?.alcoholic ? Equal(filter.alcoholic) : undefined,
      },
      order,
    });
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
    // mniej round tripów do bazy
    return res.raw[0];
  }

  // async addImage(id: string, image: Omit<IngredientImage, 'id'>) {
  //   await this.entityManager.transaction(async (em) => {
  //     await em.insert();
  //     await em.delete(IngredientImage, { ingredientId: Equal(id) });
  //   });
  // }
}
