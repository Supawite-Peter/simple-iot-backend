import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Data, DataSchema } from './schemas/data.schema';
import { DevicesDataService } from './data.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
  ],
  providers: [DevicesDataService],
  exports: [DevicesDataService],
})
export class DevicesDataModule {}
