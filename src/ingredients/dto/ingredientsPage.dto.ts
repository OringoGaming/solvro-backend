import z from 'zod';
import { ingredientResponseSchema } from './ingredientResponse.dto.js';

export const ingredientsPageSchema = z.object({
  pageCount: z.int().nonnegative(),
  ingredients: z.array(ingredientResponseSchema),
});

export type IngredientsPageDto = z.infer<typeof ingredientsPageSchema>;
