import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from './schemas/device.schema';

describe('DevicesService', () => {
  let service: DevicesService;
  let devicesModel: Model<Device>;

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

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getModelToken('Device', 'devices'),
          useValue: {
            find: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
            create: jest.fn().mockResolvedValue(null),
            deleteOne: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
            updateOne: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
            findOne: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
          },
        },
        {
          provide: getModelToken('DeviceCounter', 'devices'),
          useValue: {
            findOne: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
            create: jest.fn().mockResolvedValue(null),
            findOneAndUpdate: jest.fn().mockImplementation(() => ({
              exec: jest.fn().mockResolvedValue(null),
            })),
          },
        },
      ],
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
    devicesModel = module.get(getModelToken('Device', 'devices'));
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
      const expected_output = {
        owner_name: input.requester_name,
        owner_id: input.requester_id,
        device_id: 1,
        device_name: input.device_name,
        device_topics: input.device_topics,
      };
      jest.spyOn(devicesModel, 'create').mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(expected_output),
      } as any);
      expect(
        await service.register(
          input.requester_name,
          input.requester_id,
          input.device_name,
          input.device_topics,
        ),
      ).toEqual(expected_output);
    });

    it('should able to register when no topics are provided', async () => {
      const input = {
        requester_name: 'exist',
        requester_id: 1,
        device_name: 'device1',
        device_topics: [],
      };
      const expected_output = {
        owner_name: input.requester_name,
        owner_id: input.requester_id,
        device_id: 1,
        device_name: input.device_name,
        device_topics: input.device_topics,
      };
      jest.spyOn(devicesModel, 'create').mockResolvedValueOnce({
        toObject: jest.fn().mockReturnValue(expected_output),
      } as any);
      expect(
        await service.register(
          input.requester_name,
          input.requester_id,
          input.device_name,
          input.device_topics,
        ),
      ).toEqual(expected_output);
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
    it('should unregister a device', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
      };
      const expected_output = {
        deletedCount: 1,
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({
              owner_id: input.requester_id,
              device_id: input.device_id,
            }),
          }) as any,
      );
      jest.spyOn(devicesModel, 'deleteOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(expected_output),
          }) as any,
      );
      expect(
        await service.unregister(input.requester_id, input.device_id),
      ).toEqual(expected_output);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 3,
        device_id: 1,
      };
      await expect(
        service.unregister(input.requester_id, input.device_id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      const input = {
        requester_id: 1,
        device_id: 3,
      };
      await expect(
        service.unregister(input.requester_id, input.device_id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw unauthorized if requester is not the owner', async () => {
      const input = {
        requester_id: 1,
        device_id: 2,
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue({
              owner_id: 2,
              device_id: input.device_id,
            }),
          }) as any,
      );
      await expect(
        service.unregister(input.requester_id, input.device_id),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getDevicesList', () => {
    it('should return a list of devices registered by a requester', async () => {
      const input = {
        requester_id: 1,
      };
      jest.spyOn(devicesModel, 'find').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue([
              {
                toObject: jest.fn().mockReturnValue(device1_registered),
              },
            ]),
          }) as any,
      );
      expect(await service.getDevicesList(input.requester_id)).toEqual([
        device1_registered,
      ]);
    });

    it('should return throw not found if requester has no devices registered', async () => {
      const input = {
        requester_id: 2,
      };
      jest.spyOn(devicesModel, 'find').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue([]),
          }) as any,
      );
      await expect(service.getDevicesList(input.requester_id)).rejects.toThrow(
        NotFoundException,
      );
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
    it('should add topics to a device (input topics is a string)', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: 'topic3',
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device1_registered),
          }) as any,
      );
      const result = await service.addDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_added: 1,
        topics: ['topic3'],
      });
    });

    it('should add topics to a device (input topics is an array)', async () => {
      const input = {
        requester_id: 2,
        device_id: 2,
        topics: ['topic4', 'topic5'],
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device2_registered),
          }) as any,
      );
      const result = await service.addDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_added: 1,
        topics: ['topic5'],
      });
    });

    it('should throw bad request if all topics are already registered', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: ['topic1'],
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device1_registered),
          }) as any,
      );
      await expect(
        service.addDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 4,
        device_id: 1,
        topics: ['topic1'],
      };
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
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device2_registered),
          }) as any,
      );
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
    it('should remove topics from a device (input topics is a string)', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: 'topic1',
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device1_registered),
          }) as any,
      );
      const result = await service.removeDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_removed: 1,
        topics: ['topic1'],
      });
    });

    it('should remove topics from a device (input topics is an array)', async () => {
      const input = {
        requester_id: 2,
        device_id: 2,
        topics: ['topic2', 'topic3'],
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device2_registered),
          }) as any,
      );
      const result = await service.removeDeviceTopics(
        input.requester_id,
        input.device_id,
        input.topics,
      );
      expect(result).toEqual({
        topics_removed: 1,
        topics: ['topic3'],
      });
    });

    it('should throw bad request if no topics to be removed', async () => {
      const input = {
        requester_id: 1,
        device_id: 1,
        topics: ['topic8', 'topic9'],
      };
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device1_registered),
          }) as any,
      );
      await expect(
        service.removeDeviceTopics(
          input.requester_id,
          input.device_id,
          input.topics,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found if requester does not exist', async () => {
      const input = {
        requester_id: 3,
        device_id: 1,
        topics: 'topic1',
      };
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
      jest.spyOn(devicesModel, 'findOne').mockImplementationOnce(
        () =>
          ({
            exec: jest.fn().mockResolvedValue(device2_registered),
          }) as any,
      );
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
