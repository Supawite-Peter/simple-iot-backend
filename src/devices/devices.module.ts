import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UsersModule } from 'src/users/users.module';
import { DevicesDataModule } from './data/data.module';
import { DeviceSchema } from './schemas/device.schema';
import { DeviceCounterSchema } from './schemas/device-counter.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Device } from './schemas/device.schema';
import { DeviceCounter } from './schemas/device-counter.schema';

@Module({
  imports: [
    UsersModule,
    DevicesDataModule,
    MongooseModule.forFeature(
      [{ name: Device.name, schema: DeviceSchema }],
      'devices',
    ),
    MongooseModule.forFeature(
      [{ name: DeviceCounter.name, schema: DeviceCounterSchema }],
      'devices',
    ),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
