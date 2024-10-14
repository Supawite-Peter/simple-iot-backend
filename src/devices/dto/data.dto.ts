import { z } from 'zod';

export const devicesDataSchema = z.object({
  values: z.union([z.number(), z.array(z.number()).nonempty()]),
});
export type DevicesDataDto = z.infer<typeof devicesDataSchema>;
