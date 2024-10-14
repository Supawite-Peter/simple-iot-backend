import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Data } from './schemas/data.schema';
import { Document, Model, Types, MergeType } from 'mongoose';

@Injectable()
export class DevicesDataService {
  constructor(
    @InjectModel(Data.name)
    private dataModel: Model<Data>,
  ) {}

  async updateData(
    device_id: number,
    topic: string,
    values: number[] | number,
  ): Promise<Data | Data[]> {
    if (typeof values === 'number') {
      return await this.updateSingleData(device_id, topic, values);
    } else {
      return await this.updateMultipleData(device_id, topic, values);
    }
  }

  async updateSingleData(device_id: number, topic: string, value: number) {
    return await this.dataModel
      .create({
        timestamp: new Date(),
        metadata: {
          device_id: device_id,
          topic: topic,
        },
        value: value,
      })
      .then((doc) => this.mapDocumentstoData(doc));
  }

  async updateMultipleData(device_id: number, topic: string, values: number[]) {
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
      return this.mapDocumentsArrayToDataArray(docs);
    });
  }

  getLastestData(device_id: number, topic: string): Promise<Data> {
    return this.dataModel
      .find({
        'metadata.device_id': device_id,
        'metadata.topic': topic,
      })
      .sort({ timestamp: -1 })
      .limit(1)
      .exec()
      .then((docs) => this.mapDocumentsArrayToDataArray(docs)[0]);
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
      .then((docs) => this.mapDocumentsArrayToDataArray(docs));
  }

  private mapDocumentstoData(
    doc: MergeType<
      Document<unknown, Data> &
        Data & {
          _id: Types.ObjectId;
        } & {
          __v?: number;
        },
      Omit<any, '_id'>
    >,
  ) {
    return {
      timestamp: doc.timestamp,
      metadata: doc.metadata,
      value: doc.value,
    };
  }

  private mapDocumentsArrayToDataArray(
    docs: MergeType<
      Document<unknown, Data> &
        Data & {
          _id: Types.ObjectId;
        } & {
          __v?: number;
        },
      Omit<any, '_id'>
    >[],
  ) {
    return docs.map((doc) => this.mapDocumentstoData(doc));
  }
}
