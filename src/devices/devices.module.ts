import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesDataModule } from './data/data.module';
import { UsersModule } from '../users/users.module';
import { Device } from './entity/device.entity';
import { Topic } from './entity/topic.entity';

@Module({
  imports: [
    UsersModule,
    DevicesDataModule,
    TypeOrmModule.forFeature([Device, Topic]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
