import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UsersModule } from 'src/users/users.module';
import { DevicesDataModule } from './data/data.module';
import { DevicesSchema } from './schemas/devices.schema';
import { DevicesCounterSchema } from './schemas/devices-counter.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Devices } from './schemas/devices.schema';
import { DevicesCounter } from './schemas/devices-counter.schema';

@Module({
  imports: [
    UsersModule,
    DevicesDataModule,
    MongooseModule.forFeature(
      [{ name: Devices.name, schema: DevicesSchema }],
      'devices',
    ),
    MongooseModule.forFeature(
      [{ name: DevicesCounter.name, schema: DevicesCounterSchema }],
      'devices',
    ),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
