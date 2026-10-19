import z from 'zod';
import {
  COCKTAIL_INSTRUCTION_LENGTH,
  COCKTAIL_NAME_LENGTH,
  MAX_COCKTAIL_INGREDIENTS,
} from '../../entities/cocktail.entity.js';

export const cocktailsFilterSchema = z
  .strictObject({
    name: z.string().max(COCKTAIL_NAME_LENGTH).optional(),
    instruction: z.string().max(COCKTAIL_INSTRUCTION_LENGTH).optional(),
    // coerce evals any non empty string to true
    alcoholic: z
      .preprocess(
        (v) => (typeof v === 'string' ? 'true' === v : v),
        z.boolean(),
      )
      .optional(),
    userId: z.uuid().optional(),
    categoryIds: z
      //1 query param evals to string
      .preprocess((v) => (typeof v === 'string' ? [v] : v), z.array(z.number()))
      .refine(
        (sort) => new Set(sort).size === sort.length,
        'Duplicate category id.',
      )
      .optional(),
    ingredientIds: z
      //1 query param evals to string
      .preprocess(
        (v) => (typeof v === 'string' ? [v] : v),
        z.array(z.uuid()).max(MAX_COCKTAIL_INGREDIENTS),
      )
      .refine(
        (sort) => new Set(sort).size === sort.length,
        'Duplicate ingredient id.',
      )
      .optional(),
    sort: z
      //1 query param evals to string
      .preprocess(
        (v) => (typeof v === 'string' ? [v] : v),
        z.array(z.enum(['name', 'categoryName'])),
      )
      .refine(
        (sort) => new Set(sort).size === sort.length,
        'Duplicate sort field.',
      )
      .optional(),
    sortDir: z.enum(['ASC', 'DESC']).optional(),
  })
  .optional();

export type CocktailsFilterDto = z.infer<typeof cocktailsFilterSchema>;
