import { z } from 'zod';

export const devicesDataPeriodicSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
export type DevicesDataPeriodicDto = z.infer<typeof devicesDataPeriodicSchema>;
