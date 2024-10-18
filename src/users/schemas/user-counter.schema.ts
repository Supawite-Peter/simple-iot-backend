import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserCounterDocument = HydratedDocument<UserCounter>;

@Schema()
export class UserCounter {
  @Prop()
  counter: number;
}

export const UserCounterSchema = SchemaFactory.createForClass(UserCounter);
