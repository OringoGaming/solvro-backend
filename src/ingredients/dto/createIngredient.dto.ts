import z from 'zod';
import { INGREDIENT_DESCRIPTION_LENGTH, INGREDIENT_NAME_LENGTH, INGREDIENT_UNIQUE_NAME } from '../../entities/ingredient.entity.js';

export const createIngredientSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .nonempty()
    .describe(
      'The name of the ingredient. Must be unique. At most 64 characters long.',
    )
    .max(INGREDIENT_NAME_LENGTH),
  description: z
    .string()
    .trim()
    .max(INGREDIENT_DESCRIPTION_LENGTH)
    .describe(
      'The description of the ingredient.',
    ),
  alcoholic: z.boolean().describe('Whether the ingredient is an alcohol.'),
});

export type CreateIngredientDto = z.infer<typeof createIngredientSchema>;
