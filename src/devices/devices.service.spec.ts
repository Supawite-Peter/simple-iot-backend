import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('DevicesService', () => {
  let service: DevicesService;

  const device1_registered = {
    owner_name: 'exist1',
    owner_id: 1,
    device_id: 1,
    device_name: 'device1',
    device_topics: ['topic1', 'topic2'],
  };

  const device2_registered = {
    owner_name: 'exist2',
    owner_id: 2,
    device_id: 2,
    device_name: 'device2',
    device_topics: ['topic3', 'topic4'],
  };

  // Mocks register method
  // device_id = 1,2 => exist in database
  // else => not exist in database
  const mockRegister = function (): void {
    jest.spyOn(service, 'register').mockImplementation(() => {
      service['device_counter'] = 2;
      service['devices'].push({ ...device1_registered });
      service['devices'].push({ ...device2_registered });
      return Promise.resolve();
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesService],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            // For testing purposes
            // userId: 1,2 => exist in database
            // else => not exist in database
            findUserId: jest.fn().mockImplementation((userId) => {
              if (userId === 1) {
                return {
                  userId: 1,
                  username: 'exist1',
                  hash: 'hashpassword1',
                };
              } else if (userId === 2) {
                return {
                  userId: 2,
                  username: 'exist2',
                  hash: 'hashpassword2',
                };
              }
              return undefined;
            }),
          };
        }
      })
      .compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new device to a requester', async () => {
      const input = {
        requester_name: 'exist',
        requester_id: 1,
        device_name: 'device1',
        device_topics: ['topic1', 'topic2'],
      };
      const expected_device_id = 1;
      await service.register(
        input.requester_name,
        input.requester_id,
        input.device_name,
        input.device_topics,
      );
      expect(service['device_counter']).toBe(expected_device_id);
      expect(service['devices']).toEqual([
        {
          owner_name: input.requester_name,
          owner_id: input.requester_id,
          device_id: expected_device_id,
          device_name: input.device_name,
          device_topics: input.device_topics,
        },
      ]);
    });

    it('should able to register when no topics are provided', async () => {
      const input = {
        requester_name: 'exist',
        requester_id: 1,
        device_name: 'device1',
        device_topics: [],
      };
      const expected_device_id = 1;
      await service.register(
        input.requester_name,
        input.requester_id,
        input.device_name,
        input.device_topics,
      );
      expect(service['device_counter']).toBe(expected_device_id);
      expect(service['devices']).toEqual([
        {
          owner_name: input.requester_name,
          owner_id: input.requester_id,
          device_id: expected_device_id,
          device_name: input.device_name,
          device_topics: input.device_topics,
        },
      ]);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_name: 'notexist',
        requester_id: 3,
        device_name: 'device1',
        device_topics: ['topic1', 'topic2'],
      };
      await expect(
        service.register(
          input.requester_name,
          input.requester_id,
          input.device_name,
          input.device_topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw bad request if device name is missing', async () => {
      const input = {
        requester_name: 'exist',
        requester_id: 1,
        device_name: undefined,
        device_topics: ['topic1', 'topic2'],
      };
      await expect(
        service.register(
          input.requester_name,
          input.requester_id,
          input.device_name,
          input.device_topics,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unregister', () => {
    beforeEach(() => {
      mockRegister();
    });

    it('should unregister a device', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
      };
      await service.register('mock', 0, 'mock', undefined);
      await service.unregister(input.requester_id, input.device_id);
      expect(
        service['devices'].find((device) => device.device_id === 1),
      ).toBeUndefined();
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 3,
        device_id: 1,
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.unregister(input.requester_id, input.device_id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      const input = {
        requester_id: 1,
        device_id: 3,
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.unregister(input.requester_id, input.device_id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw unauthorized if requester is not the owner', async () => {
      const input = {
        requester_id: 1,
        device_id: 2,
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.unregister(input.requester_id, input.device_id),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getDevicesList', () => {
    beforeEach(() => {
      mockRegister();
    });

    it('should return a list of devices registered by a requester', async () => {
      const input = {
        requester_id: 1,
      };
      await service.register('mock', 0, 'mock', undefined);
      expect(await service.getDevicesList(input.requester_id)).toEqual([
        {
          owner_name: device1_registered.owner_name,
          owner_id: device1_registered.owner_id,
          device_id: device1_registered.device_id,
          device_name: device1_registered.device_name,
          device_topics: device1_registered.device_topics,
        },
      ]);
    });

    it('should return empty list if requester has no devices registered', async () => {
      const input = {
        requester_id: 2,
      };
      expect(await service.getDevicesList(input.requester_id)).toEqual([]);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 3,
      };
      await expect(service.getDevicesList(input.requester_id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addDeviceTopics', () => {
    beforeEach(() => {
      mockRegister();
    });

    it('should add topics to a device (input topics is a string)', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: 'topic3',
      };
      await service.register('', 0, '', undefined);
      const result = await service.addDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_added: 1,
        topics: ['topic3'],
      });
      expect(
        service['devices'].find(
          (device) => device.device_id === input.device_id,
        ).device_topics,
      ).toEqual(['topic1', 'topic2', 'topic3']);
    });

    it('should add topics to a device (input topics is an array)', async () => {
      const input = {
        requester_id: 2,
        device_id: 2,
        topics: ['topic4', 'topic5'],
      };
      await service.register('mock', 0, 'mock', undefined);
      const result = await service.addDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_added: 1,
        topics: ['topic5'],
      });
      expect(
        service['devices'].find(
          (device) => device.device_id === input.device_id,
        ).device_topics,
      ).toEqual(['topic3', 'topic4', 'topic5']);
    });

    it('should throw bad request if all topics are already registered', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: ['topic1'],
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.addDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(
        service['devices'].find((device) => device.device_id === 1)
          .device_topics,
      ).toEqual(['topic1', 'topic2']);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 4,
        device_id: 1,
        topics: ['topic1'],
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.addDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      const input = {
        requester_id: 1,
        device_id: 5,
        topics: ['topic1'],
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.addDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw unauthorized if requester is not the owner', async () => {
      const input = {
        requester_id: 1,
        device_id: 2,
        topics: ['topic5'],
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.addDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('removeDeviceTopics', () => {
    beforeEach(() => {
      mockRegister();
    });

    it('should remove topics from a device (input topics is a string)', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: 'topic1',
      };
      await service.register('mock', 0, 'mock', undefined);
      const result = await service.removeDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_removed: 1,
        topics: ['topic1'],
      });
      expect(
        service['devices'].find(
          (device) => device.device_id === input.device_id,
        ).device_topics,
      ).toEqual(['topic2']);
    });

    it('should remove topics from a device (input topics is an array)', async () => {
      const input = {
        requester_id: 2,
        device_id: 2,
        topics: ['topic2', 'topic3'],
      };
      await service.register('mock', 0, 'mock', undefined);
      const result = await service.removeDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_removed: 1,
        topics: ['topic3'],
      });
      expect(
        service['devices'].find(
          (device) => device.device_id === input.device_id,
        ).device_topics,
      ).toEqual(['topic4']);
    });

    it('should throw bad request if no topics to be removed', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: ['topic8', 'topic9'],
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.removeDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(
        service['devices'].find(
          (device) => device.device_id === input.device_id,
        ).device_topics,
      ).toEqual(['topic1', 'topic2']);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 3,
        device_id: 1,
        topics: 'topic1',
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.removeDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      const input = {
        requester_id: 2,
        device_id: 3,
        topics: 'topic3',
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.removeDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw unauthorized if requester is not the owner', async () => {
      const input = {
        requester_id: 1,
        device_id: 2,
        topics: 'topic3',
      };
      await service.register('mock', 0, 'mock', undefined);
      await expect(
        service.removeDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
