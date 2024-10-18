import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from './schemas/data.schema';
import { Model } from 'mongoose';
import { DevicesPayloadDataDto } from '../dto/data.dto';

@Injectable()
export class DevicesDataService {
  constructor(
    @InjectModel(Data.name, 'devices')
    private dataModel: Model<Data>,
  ) {}

  async updateData(
    device_id: number,
    topic: string,
    payload: DevicesPayloadDataDto | DevicesPayloadDataDto[],
  ): Promise<Data | Data[]> {
    if (Array.isArray(payload)) {
      if (payload.length === 1) {
        return await this.updateSingleData(device_id, topic, payload[0]);
      } else {
        return await this.updateMultipleData(device_id, topic, payload);
      }
    } else {
      return await this.updateSingleData(device_id, topic, payload);
    }
  }

  private async updateSingleData(
    device_id: number,
    topic: string,
    payload: DevicesPayloadDataDto,
  ) {
    return (
      await this.dataModel.create({
        timestamp: payload.timestamp || new Date(),
        metadata: {
          device_id: device_id,
          topic: topic,
        },
        value: payload.value,
      })
    ).toObject();
  }

  private async updateMultipleData(
    device_id: number,
    topic: string,
    payloads: DevicesPayloadDataDto[],
  ) {
    const data_to_insert = [];
    const current_date = new Date();
    for (const payload of payloads) {
      data_to_insert.push({
        timestamp: payload.timestamp || current_date,
        metadata: {
          device_id: device_id,
          topic: topic,
        },
        value: payload.value,
      });
    }
    return this.dataModel.insertMany(data_to_insert).then((docs) => {
      return docs.map((doc) => doc.toObject());
    });
  }

  async getLatestData(device_id: number, topic: string): Promise<Data> {
    return this.dataModel
      .find({
        'metadata.device_id': device_id,
        'metadata.topic': topic,
      })
      .sort({ timestamp: -1 })
      .limit(1)
      .exec()
      .then((docs) => {
        if (docs.length === 0) {
          throw new NotFoundException('No Latest Data Found');
        }
        return docs[0].toObject();
      });
  }

  async getPeriodicData(
    device_id: number,
    topic: string,
    from: string,
    to: string,
  ): Promise<Data[]> {
    return this.dataModel
      .find({
        timestamp: { $gte: from, $lte: to },
        'metadata.device_id': device_id,
        'metadata.topic': topic,
      })
      .sort({ timestamp: -1 })
      .exec()
      .then((docs) => {
        if (docs.length === 0) {
          throw new NotFoundException('No Data Found From The Given Period');
        }
        return docs.map((doc) => doc.toObject());
      });
  }
}
