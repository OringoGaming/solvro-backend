import z from 'zod';
import { IngredientUnit } from '../../entities/cocktailIngredient.entity.js';
import { ingredientResponseSchema } from '../../ingredients/dto/ingredientResponse.dto.js';
import { cocktailCategoryResponseSchema } from './cocktailCategoryResponse.dto.js';
import { Cocktail } from '../../entities/cocktail.entity.js';

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
});

export type CocktailResponseDto = z.infer<typeof cocktailResponseSchema>;

export function cocktailToDto(cocktail: Cocktail): CocktailResponseDto {
  return {
    id: cocktail.id,
    name: cocktail.name,
    instruction: cocktail.instruction,
    category: cocktail.category,
    ingredients: cocktail.cocktailIngredients.map((ci) => {
      return {
        ...ci.ingredient,
        unit: ci.unit,
        amount: parseFloat(ci.amount),
      };
    }),
  };
}
