import z from 'zod';

export const ingredientResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  alcoholic: z.boolean(),
  imagePath: z.string().nullable(),
});

export type IngredientResponseDto = z.infer<typeof ingredientResponseSchema>;
