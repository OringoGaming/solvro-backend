import z from 'zod';

//To support field path in error resp.
export const paginationSchema = z.strictObject({
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().gte(1).lte(100).default(100),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
