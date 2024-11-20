import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entity/device.entity';
import { Topic } from './entity/topic.entity';
import { User } from '../users/entity/user.entity';
import { UsersService } from '../users/users.service';
import {
  DeviceDetail,
  TopicAdd,
  TopicRemove,
} from './interfaces/device.interface';

@Injectable()
export class DevicesService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Device) private devicesRepository: Repository<Device>,
    @InjectRepository(Topic) private topicsRepository: Repository<Topic>,
  ) {}

  async register(
    requester_id: number,
    device_name: string,
    device_topics: string[],
  ): Promise<DeviceDetail> {
    // Check if user exists
    const user = await this.getUser(requester_id);

    // Check device name
    if (device_name === undefined)
      throw new BadRequestException('Device name is missing');

    // Create topics
    const topics = await this.createTopics(device_topics);

    // Register device
    const device = this.devicesRepository.create({
      name: device_name,
      user: user,
      topics: topics,
    });
    await this.devicesRepository.save(device);

    return this.getDeviceDetails(device);
  }

  async unregister(
    requester_id: number,
    device_id: number,
  ): Promise<DeviceDetail> {
    // Check if device exists
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);

    // Unregister device
    await this.devicesRepository.remove(device);

    return this.getDeviceDetails(device, device_id);
  }

  async getDevicesList(requester_id: number): Promise<DeviceDetail[]> {
    // Get & Check if user exists
    const user = await this.getUser(requester_id);
    // Get devices
    const devices = await this.findDeviceOwner(user.id);
    // Check if devices exist
    if (devices.length === 0) throw new NotFoundException('No devices found');

    return this.getDevicesDetails(devices);
  }

  async addDeviceTopics(
    requester_id: number,
    device_id: number,
    topics: string[] | string,
  ): Promise<TopicAdd> {
    // Get device
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);

    // if topics is a string, convert it to an array
    if (typeof topics === 'string') {
      topics = [topics];
    }

    // Get topics to register
    const registered_topics = this.getTopicsDetails(device);
    const to_register_topics: Set<string> = new Set();
    for (const topic of topics) {
      if (!registered_topics.includes(topic)) {
        to_register_topics.add(topic);
      }
    }
    const topics_added = Array.from(to_register_topics);

    // Check if there are topics to register
    if (topics_added.length === 0) {
      throw new BadRequestException('Topics are already registered');
    }
    await this.createTopics(topics_added, device);

    return {
      topics_added: topics_added.length,
      topics: topics_added,
    };
  }

  async removeDeviceTopics(
    requester_id: number,
    device_id: number,
    topics: string[] | string,
  ): Promise<TopicRemove> {
    // Get device
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);

    // if topics is a string, convert it to an array
    if (typeof topics === 'string') {
      topics = [topics];
    }

    // Get topics that will be removed
    const topics_to_removed = [];
    for (const topic of device.topics) {
      if (topics.includes(topic.name)) topics_to_removed.push(topic);
    }

    // Check if there are topics to remove
    if (topics_to_removed.length === 0) {
      throw new BadRequestException('Topics are not registered');
    }

    // Remove topics
    await this.topicsRepository.remove(topics_to_removed);

    return {
      topics_removed: topics_to_removed.length,
      topics: topics_to_removed.map((topic) => topic.name),
    };
  }

  async checkDeviceTopic(
    requester_id: number,
    device_id: number,
    topic: string,
  ): Promise<boolean> {
    // Get device
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);

    // Check if topic is registered
    if (!device.topics.map((t) => t.name).includes(topic)) {
      throw new BadRequestException('Topic is not registered');
    }

    return true;
  }

  private async findDeviceOwner(owner_id: number): Promise<Device[]> {
    return this.devicesRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.user', 'user')
      .leftJoinAndSelect('device.topics', 'topic')
      .where('user.id = :user_id', { user_id: owner_id })
      .getMany();
  }

  private async getUser(requester_id: number): Promise<User> {
    const user = await this.usersService.findUserId(requester_id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async getAndCheckDeviceOwner(
    device_id: number,
    owner_id: number,
  ): Promise<Device> {
    const device = await this.devicesRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.user', 'user')
      .leftJoinAndSelect('device.topics', 'topic')
      .where('device.id = :id', { id: device_id })
      .andWhere('user.id = :user_id', { user_id: owner_id })
      .getOne();
    if (!device)
      throw new NotFoundException(
        `Device with id ${device_id} was not found for user with id ${owner_id}`,
      );
    return device;
  }

  private async createTopics(
    topics_name: string[],
    device?: Device,
  ): Promise<Topic[]> {
    // Initialize topics array
    const topics_created = [] as Topic[];

    // Check if topics_name is empty
    if (topics_name.length === 0 || topics_name === undefined)
      return topics_created;

    // Create topics
    for (const topic of topics_name)
      topics_created.push(
        device != null
          ? this.topicsRepository.create({ name: topic, device: device })
          : this.topicsRepository.create({ name: topic }),
      );

    // Save topics if device is registered to the topics
    if (device != null) await this.topicsRepository.save(topics_created);

    return topics_created;
  }

  private getDeviceDetails(device: Device, id?: number): DeviceDetail {
    return {
      id: device.id ? device.id : id,
      name: device.name,
      user_id: device.user.id,
      serial: device.serial,
      topics: this.getTopicsDetails(device),
    };
  }

  private getDevicesDetails(devices: Device[]): DeviceDetail[] {
    return devices.map((device) => this.getDeviceDetails(device));
  }

  private getTopicsDetails(device: Device): string[] {
    return device.topics ? device.topics.map((topic) => topic.name) : [];
  }
}
