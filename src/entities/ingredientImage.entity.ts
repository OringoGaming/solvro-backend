import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Ingredient } from './ingredient.entity.js';

export const FK_INGREDIENT_IMAGE = 'FK_INGREDIENT_IMAGE';
export const UQ_INGREDIENT_IMAGE = 'REL_INGREDIENT_IMAGE';

@Entity()
@Unique(UQ_INGREDIENT_IMAGE, ['ingredientId'])
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
    createForeignKeyConstraints: true
  })
  @JoinColumn({
    name: 'ingredientId',
    foreignKeyConstraintName: FK_INGREDIENT_IMAGE,
  })
  ingredient: Ingredient;

  @Column()
  ingredientId: string;
}
