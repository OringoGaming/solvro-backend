import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { CocktailIngredient } from './cocktailIngredient.entity.js';
import type { IngredientImage } from './file.entity.js';

export const INGREDIENT_UNIQUE_NAME = 'UQ_INGREDIENT_NAME';
export const INGREDIENT_NAME_LENGTH = 50;
export const INGREDIENT_DESCRIPTION_LENGTH = 10000;

@Entity()
@Unique(INGREDIENT_UNIQUE_NAME, ['name'])
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: INGREDIENT_NAME_LENGTH })
  name: string;
  @Column({ type: 'varchar', length: INGREDIENT_DESCRIPTION_LENGTH })
  description: string;
  @Column({ type: 'bool' })
  alcoholic: boolean;

  @OneToMany(
    'CocktailIngredient',
    (cocktailIngredient: CocktailIngredient) => cocktailIngredient.ingredient,
  )
  cocktailIngredients: CocktailIngredient[];

  @OneToOne('IngredientImage', (image: IngredientImage) => image.ingredient, {
    cascade: true,
  })
  image: IngredientImage | null;
}
