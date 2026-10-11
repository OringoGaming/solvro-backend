import { Injectable } from '@nestjs/common';
import { DeepPartial, EntityManager } from 'typeorm';
import { Cocktail } from '../entities/cocktail.entity.js';

@Injectable()
export class CocktailsService {
  constructor(private readonly entityManager: EntityManager) {}

  find(id: string): Promise<Cocktail | null> {
    return this.entityManager.findOne(Cocktail, {
      where: { id },
      relations: {
        category: true,
        cocktailIngredients: {
          ingredient: true,
        },
      },
    });
  }

  async findPaginated(
    take: number,
    skip: number,
  ): Promise<{ cocktails: Cocktail[]; total: number }> {
    const res = await this.entityManager.findAndCount(Cocktail, {
      relations: {
        category: true,
        cocktailIngredients: {
          ingredient: true,
        },
      },
      take,
      skip,
    });

    return { cocktails: res[0], total: res[1] };
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.entityManager.delete(Cocktail, {
      id,
    });
    return res.affected ? true : false;
  }

  create(cocktail: DeepPartial<Cocktail>): Promise<Cocktail> {
    const created = this.entityManager.create(Cocktail, cocktail);
    return this.entityManager.save(Cocktail, created);
  }

  async update(
    id: string,
    cocktail: DeepPartial<Cocktail>,
  ): Promise<Cocktail | null> {
    const res = await this.entityManager.update(Cocktail, { id }, cocktail);
    if (!res.affected) return null;
    //db roundtrip, but we need the relations.
    //Race condition is irrelevant.
    return await this.entityManager.findOne(Cocktail, {
      where: { id },
      relations: {
        category: true,
        cocktailIngredients: {
          ingredient: true,
        },
      },
    });
  }
}
