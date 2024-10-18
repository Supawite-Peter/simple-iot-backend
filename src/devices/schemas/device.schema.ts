import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class Device {
  @Prop()
  owner_id: number;

  @Prop()
  owner_name: string;

  @Prop({ unique: true })
  device_id: number;

  @Prop()
  device_name: string;

  @Prop()
  device_topics: string[];
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
