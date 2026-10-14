import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { CocktailCategory } from './cocktailCategory.entity.js';
import type { CocktailIngredient } from './cocktailIngredient.entity.js';
import type { User } from './user.entity.js';

export const COCKTAIL_UNIQUE_NAME = 'UQ_COCKTAIL_NAME';
export const COCKTAIL_CATEGORY_FK = 'FK_COCKTAIL_CATEGORY';

@Entity()
@Unique(COCKTAIL_UNIQUE_NAME, ['name'])
export class Cocktail {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  instruction: string;
  @ManyToOne(
    'CocktailCategory',
    (category: CocktailCategory) => category.cocktails,
    {
      onDelete: 'RESTRICT',
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'categoryId',
    foreignKeyConstraintName: COCKTAIL_CATEGORY_FK,
  })
  category: CocktailCategory;

  @Column()
  categoryId: number;

  @OneToMany(
    'CocktailIngredient',
    (ingredient: CocktailIngredient) => ingredient.cocktail,
    {
      cascade: true,
    },
  )
  cocktailIngredients: CocktailIngredient[];

  @ManyToOne('User', (user: User) => user.cocktails, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
}
