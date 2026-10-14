import z from 'zod';
import { paginationSchema } from '../../shared/dto/pagination.dto.js';
import { INGREDIENT_NAME_LENGTH } from '../../entities/ingredient.entity.js';

export const ingredientsFilterSchema = paginationSchema.extend({
  name: z.string().max(INGREDIENT_NAME_LENGTH).optional(),
  alcoholic: z.boolean().optional(),
});
