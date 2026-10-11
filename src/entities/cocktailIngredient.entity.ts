import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Cocktail } from './cocktail.entity.js';
import type { Ingredient } from './ingredient.entity.js';

export enum IngredientUnit {
  ML = 'millilitre',
  PIECE = 'piece',
  DASHES = 'dashes',
  OTHER = 'other'
}

@Entity()
export class CocktailIngredient {
  @PrimaryColumn('uuid')
  cocktailId: string;
  @PrimaryColumn('uuid')
  ingredientId: string;

  @JoinColumn({ name: 'cocktailId' })
  @ManyToOne('Cocktail', (cocktail: Cocktail) => cocktail.cocktailIngredients, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
  })
  cocktail: Cocktail;

  @JoinColumn({ name: 'ingredientId' })
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
    precision: 2,
  })
  amount: string; // typeorm maps decimal to string.
}
