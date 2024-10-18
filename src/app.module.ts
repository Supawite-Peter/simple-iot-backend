import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { MongooseModule } from '@nestjs/mongoose';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}.local`,
      isGlobal: true,
    }),
    UsersModule,
    DevicesModule,
    MongooseModule.forRoot(process.env.DEVICES_MONGODB_URI, {
      connectionName: 'devices',
    }),
    MongooseModule.forRoot(process.env.USERS_MONGODB_URI, {
      connectionName: 'users',
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
