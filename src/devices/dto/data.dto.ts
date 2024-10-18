import { z } from 'zod';

const payloadDataSchema = z.object({
  timestamp: z.string().datetime().optional(),
  value: z.number(),
});
export const devicesDataSchema = z.object({
  payload: z.union([payloadDataSchema, z.array(payloadDataSchema).nonempty()]),
});

export type DevicesDataDto = z.infer<typeof devicesDataSchema>;
export type DevicesPayloadDataDto = z.infer<typeof payloadDataSchema>;
