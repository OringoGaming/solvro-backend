import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import type { Cocktail } from './cocktail.entity.js';
import type { Ingredient } from './ingredient.entity.js';

export enum IngredientUnit {
  ML = 'millilitre',
  PIECE = 'piece',
  DASHES = 'dashes',
  OTHER = 'other',
}

export const COCKTAIL_INGREDIENT_PK = 'PK_COCKTAIL_INGREDIENT';
export const COCKTAIL_INGREDIENT_INGREDIENT_FK =
  'FK_COCKTAIL_INGREDIENT_INGREDIENT';

@Entity()
export class CocktailIngredient {
  @PrimaryColumn('uuid', { primaryKeyConstraintName: COCKTAIL_INGREDIENT_PK })
  cocktailId: string;
  @PrimaryColumn('uuid', { primaryKeyConstraintName: COCKTAIL_INGREDIENT_PK })
  ingredientId: string;

  @JoinColumn({ name: 'cocktailId' })
  @ManyToOne('Cocktail', (cocktail: Cocktail) => cocktail.cocktailIngredients, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  cocktail: Cocktail;

  @JoinColumn({
    name: 'ingredientId',
    foreignKeyConstraintName: COCKTAIL_INGREDIENT_INGREDIENT_FK,
  })
  @ManyToOne(
    'Ingredient',
    (ingredient: Ingredient) => ingredient.cocktailIngredients,
    {
      onDelete: 'RESTRICT',
    },
  )
  ingredient: Ingredient;

  @Column({
    type: 'enum',
    enum: IngredientUnit,
  })
  unit: IngredientUnit;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2
  })
  amount: string;
}
