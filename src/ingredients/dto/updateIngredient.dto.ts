import z from 'zod';
import { createIngredientSchema } from './createIngredient.dto.js';

export const updateIngredientSchema = createIngredientSchema.partial();

export type UpdateIngredientDto = z.infer<typeof updateIngredientSchema>;
