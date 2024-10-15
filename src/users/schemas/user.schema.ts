import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  toObject: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret._id;
    },
  },
})
export class User {
  @Prop({ unique: true })
  user_id: number;

  @Prop({ unique: true })
  username: string;

  @Prop()
  hash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
