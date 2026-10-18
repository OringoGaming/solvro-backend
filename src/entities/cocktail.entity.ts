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

export const UQ_COCKTAIL_NAME = 'UQ_COCKTAIL_NAME';
export const FK_COCKTAIL_CATEGORY = 'FK_COCKTAIL_CATEGORY';
export const FK_COCKTAIL_USER = 'FK_COCKTAIL_USER';
export const COCKTAIL_NAME_LENGTH = 50;
export const COCKTAIL_INSTRUCTION_LENGTH = 10000;
export const MAX_COCKTAIL_INGREDIENTS = 50;

@Entity()
@Unique(UQ_COCKTAIL_NAME, ['name'])
export class Cocktail {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: COCKTAIL_NAME_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: COCKTAIL_INSTRUCTION_LENGTH })
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
    foreignKeyConstraintName: FK_COCKTAIL_CATEGORY,
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
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: FK_COCKTAIL_USER })
  user: User;

  @Column()
  userId: string;
}
