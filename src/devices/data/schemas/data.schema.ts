import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Date, HydratedDocument } from 'mongoose';

export type DataDocument = HydratedDocument<Data>;

@Schema({
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'minutes',
  },
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class Data {
  @Prop({ type: Date })
  timestamp: Date;

  @Prop(
    raw({
      topic: { type: String },
      deviceId: { type: Number },
    }),
  )
  metadata: Record<string, any>;

  @Prop()
  value: number;
}

export const DataSchema = SchemaFactory.createForClass(Data);
