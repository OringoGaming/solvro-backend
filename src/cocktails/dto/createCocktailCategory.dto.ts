import z from 'zod';

export const createCocktailCategorySchema = z.object({
  name: z.string().nonempty(),
});

export type CreateCocktailCategoryDto = z.infer<
  typeof createCocktailCategorySchema
>;
