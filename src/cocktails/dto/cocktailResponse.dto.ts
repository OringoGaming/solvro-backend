import z from 'zod';
import { IngredientUnit } from '../../entities/cocktailIngredient.entity.js';
import { ingredientResponseSchema } from '../../ingredients/dto/ingredientResponse.dto.js';
import { cocktailCategoryResponseSchema } from './cocktailCategoryResponse.dto.js';

export const cocktailResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  instruction: z.string().nonempty(),
  category: cocktailCategoryResponseSchema,
  ingredients: z.array(
    ingredientResponseSchema.extend({
      unit: z.enum(IngredientUnit),
      amount: z.coerce.number().positive(),
    }),
  ),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
  }),
});

export type CocktailResponseDto = z.infer<typeof cocktailResponseSchema>;
