import z from 'zod';

export const signInSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export type SignInDto = z.infer<typeof signInSchema>;
