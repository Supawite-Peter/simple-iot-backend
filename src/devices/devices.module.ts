import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { UsersModule } from 'src/users/users.module';
import { DevicesDataModule } from './data/data.module';

@Module({
  imports: [UsersModule, DevicesDataModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
