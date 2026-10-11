import { z } from 'zod';
import { createCocktailSchema } from './createCocktail.dto.js';

export const updateCocktailSchema = createCocktailSchema.partial();

export type UpdateCocktailDto = z.infer<typeof updateCocktailSchema>;
