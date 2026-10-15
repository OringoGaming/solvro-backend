import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ingredient } from './ingredient.entity.js';

export const FK_INGREDIENT_IMAGE = 'FK_INGREDIENT_IMAGE';

@Entity()
export class IngredientImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'bytea' })
  data: Buffer;
  @Column({ type: 'text' })
  mimeType: string;

  @OneToOne('Ingredient', (ingredient: Ingredient) => ingredient.image, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
    nullable: false,
  })
  @JoinColumn({
    name: 'ingredientId',
    foreignKeyConstraintName: FK_INGREDIENT_IMAGE,
  })
  ingredient: Ingredient;

  @Column()
  ingredientId: string;
}
