import { z } from 'zod';

export const unregisterSchema = z.object({
  password: z.string().min(1),
});

export type UnregisterDto = z.infer<typeof unregisterSchema>;
