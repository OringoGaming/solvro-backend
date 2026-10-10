import z from 'zod';

//image upload to inny endpoint
export const createIngredientSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  alcoholic: z.boolean(),
});

export type CreateIngredientDto = z.infer<typeof createIngredientSchema>;
