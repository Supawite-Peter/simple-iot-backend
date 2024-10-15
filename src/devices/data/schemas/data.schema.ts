import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Date, HydratedDocument } from 'mongoose';

export type DataDocument = HydratedDocument<Data>;

@Schema({
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'minutes',
  },
})
export class Data {
  @Prop({ type: Date })
  timestamp: Date;

  @Prop(
    raw({
      topic: { type: String },
      device_id: { type: Number },
    }),
  )
  metadata: Record<string, any>;

  @Prop()
  value: number;
}

export const DataSchema = SchemaFactory.createForClass(Data);