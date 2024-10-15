import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Device } from './interfaces/device.interface';

@Injectable()
export class DevicesService {
  constructor(private usersService: UsersService) {}
  private readonly devices: Device[] = [];
  private device_counter = 0;

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
    this.device_counter += 1;
    const device: Device = {
      owner_name: requester_name,
      owner_id: requester_id,
      device_id: this.device_counter,
      device_name: device_name,
      device_topics: device_topics,
    };
    this.devices.push(device);

    return;
  }

  async unregister(requester_id: number, device_id: number): Promise<any> {
    // Get device
    const device = await this.getAndCheckDeviceOwner(device_id, requester_id);
    // Unregister device
    this.devices.splice(this.devices.indexOf(device), 1);
    return;
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
    // Check if there are topics to register
    if (unique_topics.size === 0) {
      throw new BadRequestException('Topics are already registered');
    }
    // Register topics
    device.device_topics = [...device.device_topics, ...unique_topics];
    return {
      topics_added: unique_topics.size,
      topics: Array.from(unique_topics),
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
    return {
      topics_removed: topics_removed.size,
      topics: Array.from(topics_removed),
    };
  }

  private findDeviceId(device_id: number): Device | undefined {
    return this.devices.find((device) => device.device_id === device_id);
  }

  private findDeviceOwner(owner_id: number): Device[] {
    return this.devices.filter((device) => device.owner_id === owner_id);
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
    const device = this.findDeviceId(device_id);
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
}
