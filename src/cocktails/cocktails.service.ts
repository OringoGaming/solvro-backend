import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DeepPartial, EntityManager } from 'typeorm';
import {
  Cocktail,
  FK_COCKTAIL_CATEGORY,
  FK_COCKTAIL_USER,
  UQ_COCKTAIL_NAME,
} from '../entities/cocktail.entity.js';
import {
  COCKTAIL_INGREDIENT_INGREDIENT_FK,
  CocktailIngredient,
} from '../entities/cocktailIngredient.entity.js';
import { User } from '../entities/user.entity.js';
import {
  extractConstraintError,
  PgErrorCode,
} from '../shared/utils/dbErrors.js';

const cocktailRelations = {
  category: true,
  cocktailIngredients: {
    ingredient: true,
  },
  user: true,
};

function rethrowCocktailSaveError(e: unknown): unknown {
  const driverError = extractConstraintError(e);
  if (!driverError) return e;
  const { code, constraint } = driverError;
  if (code === PgErrorCode.FOREIGN_KEY_VIOLATION) {
    switch (constraint) {
      case FK_COCKTAIL_CATEGORY:
        return new UnprocessableEntityException(
          'Cocktail category does not exist.',
        );
      case FK_COCKTAIL_USER:
        return new UnprocessableEntityException('User does not exist.');
      case COCKTAIL_INGREDIENT_INGREDIENT_FK:
        return new ConflictException('Cocktail ingredient does not exist.');
    }
  }

  if (code === PgErrorCode.UNIQUE_VIOLATION && constraint === UQ_COCKTAIL_NAME)
    return new ConflictException('Cocktail name is already taken.');
  return e;
}

export type CocktailInput = DeepPartial<
  Omit<Cocktail, 'id' | 'cocktailCategory' | 'user' | 'userId'>
>;

export interface CocktailsPage {
  total: number;
  cocktails: Cocktail[];
}

export interface CocktailsFilter {
  take: number;
  skip: number;
  name?: string;
  instruction?: string;
  ingredientIds?: string[];
  userId?: string;
  alcoholic?: boolean;
}

@Injectable()
export class CocktailsService {
  constructor(private readonly entityManager: EntityManager) {}

  find(id: string): Promise<Cocktail | null> {
    return this.entityManager.findOne(Cocktail, {
      where: { id },
      relations: cocktailRelations,
    });
  }

  async findPaginated({
    take,
    skip,
    name,
    instruction,
    ingredientIds,
    userId,
    alcoholic,
  }: CocktailsFilter): Promise<CocktailsPage> {
    const query = this.entityManager
      .createQueryBuilder(Cocktail, 'cocktail')
      .leftJoinAndSelect('cocktail.category', 'category')
      .leftJoinAndSelect('cocktail.user', 'user')
      .leftJoinAndSelect('cocktail.cocktailIngredients', 'cocktailIngredient')
      .leftJoinAndSelect('cocktailIngredient.ingredient', 'ingredient')
      .take(take)
      .skip(skip)
      .addOrderBy('cocktail.name')
      .addOrderBy('cocktail.id');

    if (name) {
      query.andWhere("cocktail.name ILIKE '%' || :name || '%'", {
        name,
      });
    }
    if (instruction) {
      query.andWhere("cocktail.description ILIKE '%' || :instruction || '%'", {
        instruction,
      });
    }
    if (ingredientIds?.length) {
      query.andWhere(
        (qb) =>
          'cocktail.id IN ' +
          qb
            .subQuery()
            .select('ci.cocktailId')
            .from(CocktailIngredient, 'ci')
            .where('ci.ingredientId IN (:...ingredientIds)', { ingredientIds })
            .groupBy('ci.cocktailId')
            .having('COUNT(*) = :idCount', { idCount: ingredientIds.length })
            .getQuery(),
      );
    }

    if (alcoholic !== undefined) {
      query.andWhere(
        (qb) =>
          (alcoholic ? 'EXISTS ' : 'NOT EXISTS ') +
          qb
            .subQuery()
            .select('1')
            .from(CocktailIngredient, 'ci')
            .innerJoin('ci.ingredient', 'i')
            .where('ci.cocktailId = cocktail.id')
            .andWhere('i.alcoholic = TRUE')
            .getQuery(),
      );
    }

    if (userId) {
      query.andWhere('cocktail.userId = :userId', { userId });
    }

    const res = await query.getManyAndCount();

    return { cocktails: res[0], total: res[1] };
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.entityManager.delete(Cocktail, {
      id,
    });
    return res.affected ? true : false;
  }

  async create(cocktail: CocktailInput, user: User): Promise<Cocktail> {
    const created = this.entityManager.create(Cocktail, {
      ...cocktail,
      userId: user.id,
    });
    try {
      return await this.entityManager.transaction(async (mgr) => {
        const { id } = await mgr.save(Cocktail, created);
        // get the created cocktail before the transaction is commited, so nothing else can update.
        return await mgr.findOneOrFail(Cocktail, {
          where: { id },
          relations: cocktailRelations,
        });
      });
    } catch (e) {
      throw rethrowCocktailSaveError(e);
    }
  }

  async update(id: string, input: CocktailInput): Promise<Cocktail | null> {
    let result;
    try {
      result = await this.entityManager.transaction(async (mgr) => {
        //save handles cascade here.
        const inDb = await mgr.findOne(Cocktail, {
          where: { id },
          lock: { mode: 'pessimistic_write' },
        });
        if (inDb === null) return null;
        await mgr.save(Cocktail, { id, ...input });
      });
    } catch (e) {
      throw rethrowCocktailSaveError(e);
    }
    if (result === null) return null;
    //We want the relations.
    //Race condition doesn't matter
    return await this.entityManager.findOne(Cocktail, {
      where: { id },
      relations: cocktailRelations,
    });
  }
}
