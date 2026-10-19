import z from 'zod';
import { COCKTAIL_CATEGORY_NAME_LENGTH } from '../../entities/cocktailCategory.entity.js';

export const createCocktailCategorySchema = z.strictObject({
  name: z.string().nonempty().max(COCKTAIL_CATEGORY_NAME_LENGTH),
});

export type CreateCocktailCategoryDto = z.infer<
  typeof createCocktailCategorySchema
>;
