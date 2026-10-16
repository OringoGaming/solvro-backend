import z from 'zod';
import {
  INGREDIENT_DESCRIPTION_LENGTH,
  INGREDIENT_NAME_LENGTH,
} from '../../entities/ingredient.entity.js';

export const ingredientsFilterSchema = z
  .strictObject({
    name: z.string().max(INGREDIENT_NAME_LENGTH).optional(),
    description: z.string().max(INGREDIENT_DESCRIPTION_LENGTH).optional(),
    // coerce evals any string to true
    alcoholic: z
      .preprocess(
        (v) => (typeof v === 'string' ? 'true' === v : v),
        z.boolean(),
      )
      .optional(),
    sort: z
      //1 query param evals to string
      .preprocess(
        (v) => (typeof v === 'string' ? [v] : v),
        z.array(z.enum(['name', 'alcoholic'])),
      )
      .refine(
        (sort) => new Set(sort).size === sort.length,
        'Duplicate sort field.',
      )
      .optional(),
    sortDir: z.enum(['ASC', 'DESC']).optional(),
  })
  .optional();

export type IngredientsFilterDto = z.infer<typeof ingredientsFilterSchema>;
