import z from 'zod';
import { INGREDIENT_NAME_LENGTH } from '../../entities/ingredient.entity.js';

export const ingredientsFilterSchema = z
  .strictObject({
    name: z.string().max(INGREDIENT_NAME_LENGTH).optional(),
    alcoholic: z.coerce.boolean().optional(),
    sort: z
      .array(z.enum(['name', 'alcoholic']))
      .superRefine((sort, ctx) => {
        const seen = new Set<string>();
        for (const [i, item] of sort.entries()) {
          if (seen.has(item)) {
            ctx.addIssue({
              code: 'invalid_value',
              message: 'Duplicate sort field.',
              path: [i],
              values: [item],
            });
            continue;
          }
          seen.add(item);
        }
      })
      .optional(),
  })
  .optional();

export type IngredientsFilterDto = z.infer<typeof ingredientsFilterSchema>;
