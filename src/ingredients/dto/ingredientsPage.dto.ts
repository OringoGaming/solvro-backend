import z from 'zod';
import { ingredientResponseSchema } from './ingredientResponse.dto.js';

export const ingredientsPageSchema = z.object({
  ingredients: z.array(ingredientResponseSchema),
  pageCount: z.int().positive(),
});

export type IngredientsPageDto = z.infer<typeof ingredientsPageSchema>;
