import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DevicesModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.example'],
    }),
    MongooseModule.forRoot(process.env.DEVICES_MONGODB_URI),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
