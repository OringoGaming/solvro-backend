import z from 'zod';
import { IngredientUnit } from '../../entities/cocktailIngredient.entity.js';
import { cocktailResponseSchema } from './cocktailResponse.dto.js';

//TODO: errors
export const createCocktailSchema = z.strictObject({
  name: z.string().nonempty(),
  instruction: z.string().nonempty(),
  categoryId: z.number(),
  ingredients: z.array(
    z.object({
      id: z.uuid(),
      unit: z.enum(IngredientUnit),
      amount: z.number(),
    }),
  ),
});

export type CreateCocktailDto = z.infer<typeof createCocktailSchema>;
