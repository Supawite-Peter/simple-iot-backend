import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from './schemas/data.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesDataService {
  constructor(
    @InjectModel(Data.name, 'devices')
    private dataModel: Model<Data>,
  ) {}

  async updateData(
    device_id: number,
    topic: string,
    values: number[] | number,
  ): Promise<Data | Data[]> {
    if (typeof values === 'number') {
      return await this.updateSingleData(device_id, topic, values);
    } else if (values.length === 1) {
      return await this.updateSingleData(device_id, topic, values[0]);
    } else {
      return await this.updateMultipleData(device_id, topic, values);
    }
  }

  private async updateSingleData(
    device_id: number,
    topic: string,
    value: number,
  ) {
    return (
      await this.dataModel.create({
        timestamp: new Date(),
        metadata: {
          device_id: device_id,
          topic: topic,
        },
        value: value,
      })
    ).toObject();
  }

  private async updateMultipleData(
    device_id: number,
    topic: string,
    values: number[],
  ) {
    const incoming_data = [];
    const current_date = new Date();
    for (const value of values) {
      incoming_data.push({
        timestamp: current_date,
        metadata: {
          device_id: device_id,
          topic: topic,
        },
        value: value,
      });
    }
    return this.dataModel.insertMany(incoming_data).then((docs) => {
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
