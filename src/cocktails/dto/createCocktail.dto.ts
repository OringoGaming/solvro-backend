import z from 'zod';
import { MAX_COCKTAIL_INGREDIENTS } from '../../entities/cocktail.entity.js';
import { IngredientUnit } from '../../entities/cocktailIngredient.entity.js';

export const createCocktailSchema = z.strictObject({
  name: z.string().nonempty(),
  instruction: z.string(),
  categoryId: z.number(),
  ingredients: z
    .array(
      z.object({
        id: z.uuid(),
        unit: z.enum(IngredientUnit),
        amount: z.number().positive().max(999).multipleOf(0.01)
      }),
    )
    .max(MAX_COCKTAIL_INGREDIENTS)
    .superRefine((ingredients, ctx) => {
      const seen = new Set<string>();
      for (const [i, item] of ingredients.entries()) {
        if (seen.has(item.id)) {
          ctx.addIssue({
            code: 'invalid_value',
            message: 'Duplicate ingredient id.',
            path: [i],
            values: [item.id],
          });
          continue;
        }
        seen.add(item.id);
      }
    }),
});

export type CreateCocktailDto = z.infer<typeof createCocktailSchema>;
