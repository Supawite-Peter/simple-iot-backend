import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Device } from './interfaces/device.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Devices } from './schemas/devices.schema';
import { DevicesCounter } from './schemas/devices-counter.schema';
import { Model } from 'mongoose';

@Injectable()
export class DevicesService {
  constructor(
    private usersService: UsersService,
    @InjectModel(Devices.name, 'devices') private devicesModel: Model<Devices>,
    @InjectModel(DevicesCounter.name, 'devices')
    private devicesCounterModel: Model<DevicesCounter>,
  ) {}

  async register(
    requester_name: string,
    requester_id: number,
    device_name: string,
    device_topics: string[],
  ): Promise<any> {
    // Check if user exists
    await this.checkUserExist(requester_id);

    // Check Input
    if (device_name === undefined) {
      throw new BadRequestException('Device name is missing');
    }
    if (device_topics === undefined) {
      device_topics = [];
    }

    // Register device
    const current_counter = await this.getAndIncreaseDeviceCounter();
    return (
      await this.devicesModel.create({
        owner_name: requester_name,
        owner_id: requester_id,
        device_id: current_counter,
        device_name: device_name,
        device_topics: device_topics,
      })
    ).toObject();
  }

  async unregister(requester_id: number, device_id: number): Promise<any> {
    await this.getAndCheckDeviceOwner(device_id, requester_id);
    // Unregister device
    return this.devicesModel.deleteOne({ device_id: device_id }).exec();
  }

  async getDevicesList(requester_id: number): Promise<Device[]> {
    // Check if user exists
    await this.checkUserExist(requester_id);
    return this.findDeviceOwner(requester_id);
  }

  async addDeviceTopics(
    requester_id: number,
    device_id: number,
    topics: string[] | string,
  ): Promise<any> {
    // Get device
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);

    // if topics is a string, convert it to an array
    if (typeof topics === 'string') {
      topics = [topics];
    }

    // Get unique topics that are not already registered
    const unique_topics: Set<string> = new Set();
    for (const topic of topics) {
      if (!device.device_topics.includes(topic)) {
        unique_topics.add(topic);
      }
    }
    const topics_added = Array.from(unique_topics);
    // Check if there are topics to register
    if (topics_added.length === 0) {
      throw new BadRequestException('Topics are already registered');
    }
    // Register topics
    await this.devicesModel
      .updateOne(
        { device_id: device_id },
        { $push: { device_topics: { $each: topics_added } } },
        { upsert: false },
      )
      .exec();
    return {
      topics_added: topics_added.length,
      topics: topics_added,
    };
  }

  async removeDeviceTopics(
    requester_id: number,
    device_id: number,
    topics: string[] | string,
  ): Promise<any> {
    // Get device
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);
    // if topics is a string, convert it to an array
    if (typeof topics === 'string') {
      topics = [topics];
    }
    // Get topics that will be removed
    const topics_removed = new Set();
    for (const topic of topics) {
      if (device.device_topics.includes(topic)) {
        topics_removed.add(topic);
      }
    }
    // Check if there are topics to remove
    if (topics_removed.size === 0) {
      throw new BadRequestException('Topics are not registered');
    }
    // Remove topics
    device.device_topics = device.device_topics.filter(
      (topic) => !topics_removed.has(topic),
    );
    await this.devicesModel
      .updateOne(
        { device_id: device_id },
        { $set: { device_topics: device.device_topics } },
        { upsert: false },
      )
      .exec();

    return {
      topics_removed: topics_removed.size,
      topics: Array.from(topics_removed),
    };
  }

  async checkDeviceTopic(
    requester_id: number,
    device_id: number,
    topic: string,
  ): Promise<boolean> {
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);
    if (!device.device_topics.includes(topic)) {
      throw new BadRequestException('Topic is not registered');
    }
    return true;
  }

  private async getDeviceCounter(): Promise<DevicesCounter> {
    return this.devicesCounterModel.findOne().exec();
  }

  private async initDeviceCounter(val: number): Promise<DevicesCounter> {
    return this.devicesCounterModel.create({ counter: val });
  }

  private async getAndIncreaseDeviceCounter(): Promise<number> {
    const counter_doc = await this.getDeviceCounter();
    if (counter_doc === null) {
      await this.initDeviceCounter(1);
      return 1;
    }
    await this.devicesCounterModel
      .findOneAndUpdate({}, { counter: counter_doc.counter + 1 })
      .exec();
    return counter_doc.counter + 1;
  }

  private async findDeviceId(device_id: number): Promise<Devices> {
    return this.devicesModel
      .findOne({
        device_id: device_id,
      })
      .exec()
      .then((doc) => {
        if (!doc) {
          throw new NotFoundException(
            `Device with id ${device_id} was not found`,
          );
        }
        return doc;
      });
  }

  private async findDeviceOwner(owner_id: number): Promise<Device[]> {
    return this.devicesModel
      .find({ owner_id: owner_id })
      .exec()
      .then((docs) => {
        if (docs.length === 0) {
          throw new NotFoundException(
            `No devices found for user with id ${owner_id}`,
          );
        }
        return docs;
      });
  }

  private async checkUserExist(requester_id: number): Promise<boolean> {
    const user = await this.usersService.findUserId(requester_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  private async getAndCheckDeviceOwner(
    device_id: number,
    requester_id: number,
  ): Promise<Device> {
    // Check if user exists
    await this.checkUserExist(requester_id);
    // Check if device id exists
    const device = await this.findDeviceId(device_id);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    // Check ownership
    if (device.owner_id !== requester_id) {
      throw new UnauthorizedException(
        'Requester is not the owner of the device',
      );
    }
    return device;
  }
}
