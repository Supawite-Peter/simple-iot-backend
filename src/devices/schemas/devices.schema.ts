import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DevicesDocument = HydratedDocument<Devices>;

@Schema({
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class Devices {
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

export const DevicesSchema = SchemaFactory.createForClass(Devices);
