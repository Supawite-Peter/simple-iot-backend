import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DevicesCounterDocument = HydratedDocument<DevicesCounter>;

@Schema()
export class DevicesCounter {
  @Prop()
  counter: number;
}

export const DevicesCounterSchema =
  SchemaFactory.createForClass(DevicesCounter);
