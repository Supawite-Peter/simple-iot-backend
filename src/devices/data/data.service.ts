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
    deviceId: number,
    topic: string,
    payload: DevicesPayloadDataDto | DevicesPayloadDataDto[],
  ): Promise<Data | Data[]> {
    if (Array.isArray(payload)) {
      if (payload.length === 1) {
        return await this.updateSingleData(deviceId, topic, payload[0]);
      } else {
        return await this.updateMultipleData(deviceId, topic, payload);
      }
    } else {
      return await this.updateSingleData(deviceId, topic, payload);
    }
  }

  private async updateSingleData(
    deviceId: number,
    topic: string,
    payload: DevicesPayloadDataDto,
  ) {
    return (
      await this.dataModel.create({
        timestamp: payload.timestamp || new Date(),
        metadata: {
          deviceId: deviceId,
          topic: topic,
        },
        value: payload.value,
      })
    ).toObject();
  }

  private async updateMultipleData(
    deviceId: number,
    topic: string,
    payloads: DevicesPayloadDataDto[],
  ) {
    const dataToInsert = [];
    const currentDate = new Date();
    for (const payload of payloads) {
      dataToInsert.push({
        timestamp: payload.timestamp || currentDate,
        metadata: {
          deviceId: deviceId,
          topic: topic,
        },
        value: payload.value,
      });
    }
    return this.dataModel.insertMany(dataToInsert).then((docs) => {
      return docs.map((doc) => doc.toObject());
    });
  }

  async getLatestData(deviceId: number, topic: string): Promise<Data> {
    return this.dataModel
      .find({
        'metadata.deviceId': deviceId,
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
    deviceId: number,
    topic: string,
    from: string,
    to: string,
  ): Promise<Data[]> {
    return this.dataModel
      .find({
        timestamp: { $gte: from, $lte: to },
        'metadata.deviceId': deviceId,
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
