import z from 'zod';

export const cocktailCategoryResponseSchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
});

export type CocktailCategoryResposeDto = z.infer<
  typeof cocktailCategoryResponseSchema
>;
