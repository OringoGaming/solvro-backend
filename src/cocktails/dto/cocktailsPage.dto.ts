import z from 'zod';
import { cocktailResponseSchema } from './cocktailResponse.dto.js';

export const cocktailsPageSchema = z.object({
  cocktails: z.array(cocktailResponseSchema),
  pageCount: z.int().positive(),
});

export type CocktailsPageDto = z.infer<typeof cocktailsPageSchema>;
