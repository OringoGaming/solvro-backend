import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity.js';
import { InjectEntityManager } from '@nestjs/typeorm';

export type IngredientsPage = { ingredients: Ingredient[]; total: number };
export type IngredientInput = Partial<Omit<Ingredient, 'id' | 'cocktailIngredients'>>;

@Injectable()
export class IngredientsService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findPaginated(
    take: number,
    skip: number,
  ): Promise<IngredientsPage> {
    const result = await this.entityManager.findAndCount(Ingredient, {
      take,
      skip,
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

  create(
    ingredient: IngredientInput
  ): Promise<Ingredient> {
    const created = this.entityManager.create(Ingredient, ingredient);
    return this.entityManager.save(Ingredient, created);
  }

  async update(
    id: string,
    ingredient: IngredientInput
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
}
