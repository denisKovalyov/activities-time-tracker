import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Please use valid email',
  }),
  password: z.string().min(1, {
    message: 'Password should have at least 8 symbols',
  }),
});
