import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceCounterDocument = HydratedDocument<DeviceCounter>;

@Schema()
export class DeviceCounter {
  @Prop()
  counter: number;
}

export const DeviceCounterSchema = SchemaFactory.createForClass(DeviceCounter);
