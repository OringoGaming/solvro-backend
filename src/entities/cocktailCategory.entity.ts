import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Cocktail } from './cocktail.entity.js';

export const COCKTAIL_CATEGORY_UNIQUE_NAME = 'UQ_COCKTAIL_CATEGORY_NAME';

@Entity()
@Unique(COCKTAIL_CATEGORY_UNIQUE_NAME, ['name'])
export class CocktailCategory {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column({ type: 'text' })
  name: string;

  @OneToMany('Cocktail', (cocktail: Cocktail) => cocktail.category)
  cocktails: Cocktail[];
}
