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
export const FK_INGREDIENT_USER = 'FK_COCKTAIL_USER';

@Entity()
@Unique(UQ_COCKTAIL_NAME, ['name'])
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
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: FK_INGREDIENT_USER })
  user: User;

  @Column()
  userId: string;
}
