import z from 'zod';
import { createCocktailCategorySchema } from './createCocktailCategory.dto.js';

export const updateCocktailCategorySchema =
  createCocktailCategorySchema.partial();

export type UpdateCocktailDto = z.infer<typeof updateCocktailCategorySchema>;
