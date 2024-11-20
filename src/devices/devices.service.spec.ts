import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevicesService } from './devices.service';
import { UsersService } from '../users/users.service';
import { Device } from './entity/device.entity';
import { Topic } from './entity/topic.entity';
import { User } from '../users/entity/user.entity';

describe('DevicesService', () => {
  let service: DevicesService;
  let deviceRepository: Repository<Device>;
  let topicRepository: Repository<Topic>;

  // For testing purposes
  // userId: 1,2,3 => exist in database
  // deviceId: 1,2, => exist in database
  // topicId: 1,2,3,4 => exist in database
  // else => not exist in database
  const device1StubInfo = {
    ownerId: 1,
    ownerName: 'exist1',
    ownerPass: 'hashpassword1',
    deviceId: 1,
    deviceName: 'device1',
    deviceTopics: {
      id: [1, 2],
      name: ['topic1', 'topic2'],
    },
  };
  const device2StubInfo = {
    ownerId: 2,
    ownerName: 'exist2',
    ownerPass: 'hashpassword2',
    deviceId: 2,
    deviceName: 'device2',
    deviceTopics: {
      id: [3, 4],
      name: ['topic3', 'topic4'],
    },
  };
  const user3StubInfo = {
    id: 3,
    username: 'exist3',
    passwordHash: 'hashpassword3',
  };

  const createUserStub = (
    id: number,
    username: string,
    passwordHash: string,
    firstName: string = undefined,
    lastName: string = undefined,
  ) => {
    const user = new User();
    user.id = id;
    user.username = username;
    user.passwordHash = passwordHash;
    user.firstName = firstName;
    user.lastName = lastName;
    return user;
  };

  const createTopicStub = (id: number, name: string) => {
    const topic = new Topic();
    topic.id = id;
    topic.name = name;
    return topic;
  };

  const createDeviceStubFromInfo = (info: any) => {
    return createDeviceStub(
      info.deviceId,
      info.deviceName,
      createUserStub(info.ownerId, info.ownerName, info.ownerPass),
      createTopicsStub(info.deviceTopics.id, info.deviceTopics.name),
    );
  };

  const createDeviceStub = (
    id: number,
    name: string,
    user: User,
    topics: Topic[],
  ) => {
    const device = new Device();
    device.id = id;
    device.name = name;
    device.user = user;
    device.topics = topics;
    return device;
  };

  const createTopicsStub = (id: number[], name: string[]) => {
    if (id.length !== name.length) throw new Error('Invalid input');
    const topics: Topic[] = [];
    for (let i = 0; i < id.length; i++) {
      topics.push(createTopicStub(id[i], name[i]));
    }
    return topics;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            create: jest.fn().mockReturnValue(null),
            save: jest.fn().mockResolvedValue(null),
            remove: jest.fn().mockResolvedValue(null),
            createQueryBuilder: jest.fn().mockImplementation(() => ({
              leftJoinAndSelect: jest.fn().mockImplementation(() => ({
                leftJoinAndSelect: jest.fn().mockImplementation(() => ({
                  where: jest
                    .fn()
                    .mockImplementation((impression1, where1) => ({
                      getMany: jest.fn().mockImplementation(() => {
                        if (where1.user_id === device1StubInfo.ownerId)
                          return Promise.resolve([
                            createDeviceStubFromInfo(device1StubInfo),
                          ]);
                        else if (where1.user_id === device2StubInfo.ownerId)
                          return Promise.resolve([
                            createDeviceStubFromInfo(device2StubInfo),
                          ]);
                        else return Promise.resolve([]);
                      }),
                      andWhere: jest
                        .fn()
                        .mockImplementation((impression2, where2) => ({
                          getOne: jest.fn().mockImplementation(() => {
                            if (
                              where1.id === device1StubInfo.deviceId &&
                              where2.user_id === device1StubInfo.ownerId
                            )
                              return Promise.resolve(
                                createDeviceStubFromInfo(device1StubInfo),
                              );
                            else if (
                              where1.id === device2StubInfo.deviceId &&
                              where2.user_id === device2StubInfo.ownerId
                            )
                              return Promise.resolve(
                                createDeviceStubFromInfo(device2StubInfo),
                              );
                            else return Promise.resolve(undefined);
                          }),
                        })),
                    })),
                })),
              })),
            })),
          },
        },
        {
          provide: getRepositoryToken(Topic),
          useValue: {
            remove: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation((topicName) => {
              const topic = new Topic();
              topic.name = topicName;
              return topic;
            }),
            save: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    })
      .useMocker((token) => {
        if (token === UsersService) {
          return {
            findUserId: jest.fn().mockImplementation((userId) => {
              switch (userId) {
                case device1StubInfo.ownerId:
                  return Promise.resolve({
                    id: device1StubInfo.ownerId,
                    username: device1StubInfo.ownerName,
                    passwordHash: device1StubInfo.ownerPass,
                  } as User);
                case device2StubInfo.ownerId:
                  return Promise.resolve({
                    id: device2StubInfo.ownerId,
                    username: device2StubInfo.ownerName,
                    passwordHash: device2StubInfo.ownerPass,
                  } as User);
                case user3StubInfo.id:
                  return Promise.resolve({
                    id: user3StubInfo.id,
                    username: user3StubInfo.username,
                    passwordHash: user3StubInfo.passwordHash,
                  } as User);
                default:
                  return Promise.resolve(undefined);
              }
            }),
          };
        }
      })
      .compile();

    service = module.get<DevicesService>(DevicesService);
    deviceRepository = module.get(getRepositoryToken(Device));
    topicRepository = module.get(getRepositoryToken(Topic));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(deviceRepository).toBeDefined();
    expect(topicRepository).toBeDefined();
  });

  describe('register', () => {
    it('should register a new device to a requester', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceName: 'New Device',
        deviceTopics: ['NewTopic1', 'NewTopic2'],
      };
      const userStub = createUserStub(
        device1StubInfo.ownerId,
        device1StubInfo.ownerName,
        device1StubInfo.ownerPass,
      );
      const topicsStub = createTopicsStub([7, 8], input.deviceTopics);
      jest.spyOn(deviceRepository, 'create').mockReturnValueOnce({
        id: 99,
        name: input.deviceName,
        user: userStub,
        topics: topicsStub,
      } as Device);

      // Act & Assert
      expect(
        await service.register(
          input.requesterId,
          input.deviceName,
          input.deviceTopics,
        ),
      ).toEqual({
        id: 99,
        name: input.deviceName,
        serial: undefined,
        userId: input.requesterId,
        topics: input.deviceTopics,
      });
    });

    it('should able to register when no topics are provided', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceName: 'New Device 2',
        deviceTopics: [],
      };
      const userStub = createUserStub(
        device1StubInfo.ownerId,
        device1StubInfo.ownerName,
        device1StubInfo.ownerPass,
      );
      jest.spyOn(deviceRepository, 'create').mockReturnValueOnce({
        id: 100,
        name: input.deviceName,
        user: userStub,
        topics: [],
      } as Device);

      // Act & Assert
      expect(
        await service.register(
          input.requesterId,
          input.deviceName,
          input.deviceTopics,
        ),
      ).toEqual({
        id: 100,
        name: input.deviceName,
        serial: undefined,
        userId: input.requesterId,
        topics: input.deviceTopics,
      });
    });

    it('should throw not found if requester does not exist', async () => {
      // Arrange
      const input = {
        requesterId: 4,
        deviceName: 'New Device 3',
        deviceTopics: ['NewTopic3', 'NewTopic4'],
      };

      // Act & Assert
      await expect(
        service.register(
          input.requesterId,
          input.deviceName,
          input.deviceTopics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw bad request if device name is missing', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceName: undefined,
        deviceTopics: ['NewTopic5', 'NewTopic6'],
      };

      // Act & Assert
      await expect(
        service.register(
          input.requesterId,
          input.deviceName,
          input.deviceTopics,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unregister', () => {
    it('should unregister a device', async () => {
      // Act & Assert
      expect(
        await service.unregister(
          device1StubInfo.ownerId,
          device1StubInfo.deviceId,
        ),
      ).toEqual({
        id: device1StubInfo.deviceId,
        name: device1StubInfo.deviceName,
        serial: undefined,
        userId: device1StubInfo.ownerId,
        topics: device1StubInfo.deviceTopics.name,
      });
    });

    it('should throw not found if requester does not exist', async () => {
      // Act & Assert
      await expect(service.unregister(3, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      // Act & Assert
      await expect(service.unregister(1, 3)).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if requester is not the owner', async () => {
      // Act & Assert
      await expect(service.unregister(1, 2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDevicesList', () => {
    it('should return a list of devices registered by a requester', async () => {
      // Act & Assert
      expect(await service.getDevicesList(device1StubInfo.ownerId)).toEqual([
        {
          id: device1StubInfo.deviceId,
          name: device1StubInfo.deviceName,
          serial: undefined,
          userId: device1StubInfo.ownerId,
          topics: device1StubInfo.deviceTopics.name,
        },
      ]);
    });

    it('should return throw not found if requester has no devices registered', async () => {
      // Act & Assert
      await expect(service.getDevicesList(user3StubInfo.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw not found if requester does not exist', async () => {
      await expect(service.getDevicesList(4)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addDeviceTopics', () => {
    it('should add topics to a device (input topics is a string)', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: 'NewTopic7',
      };

      // Act & Assert
      expect(
        await service.addDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).toEqual({
        topicsAdded: 1,
        topics: [input.topics],
      });
    });

    it('should add topics to a device (input topics is an array)', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: ['NewTopic8', 'NewTopic9'],
      };

      // Act & Assert
      expect(
        await service.addDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).toEqual({
        topicsAdded: 2,
        topics: input.topics,
      });
    });

    it('should throw bad request if all topics are already registered', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: device1StubInfo.deviceTopics.name,
      };

      // Act & Assert
      await expect(
        service.addDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found if requester does not exist', async () => {
      // Arrange
      const input = {
        requesterId: 4,
        deviceId: device1StubInfo.deviceId,
        topics: ['NewTopic10'],
      };

      // Act & Assert
      await expect(
        service.addDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: 5,
        topics: ['NewTopic11'],
      };

      // Act & Assert
      await expect(
        service.addDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if requester is not the owner', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device2StubInfo.deviceId,
        topics: ['NewTopic12'],
      };

      // Act & Assert
      await expect(
        service.addDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeDeviceTopics', () => {
    it('should remove topics from a device (input topics is a string)', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: device1StubInfo.deviceTopics.name[0],
      };

      // Act & Assert
      expect(
        await service.removeDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).toEqual({
        topicsRemoved: 1,
        topics: [device1StubInfo.deviceTopics.name[0]],
      });
    });

    it('should remove topics from a device (input topics is an array)', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: device1StubInfo.deviceTopics.name,
      };

      // Act & Assert
      expect(
        await service.removeDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).toEqual({
        topicsRemoved: device1StubInfo.deviceTopics.name.length,
        topics: device1StubInfo.deviceTopics.name,
      });
    });

    it('should throw bad request if no topics to be removed', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: device2StubInfo.deviceTopics.name,
      };

      // Act & Assert
      await expect(
        service.removeDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found if requester does not exist', async () => {
      // Arrange
      const input = {
        requesterId: 3,
        deviceId: device1StubInfo.deviceId,
        topics: device1StubInfo.deviceTopics.name,
      };

      // Act & Assert
      await expect(
        service.removeDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if device does not exist', async () => {
      // Arrange
      const input = {
        requesterId: device1StubInfo.ownerId,
        deviceId: 3,
        topics: device1StubInfo.deviceTopics.name,
      };

      // Act & Assert
      await expect(
        service.removeDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw not found if requester is not the owner', async () => {
      const input = {
        requesterId: device2StubInfo.ownerId,
        deviceId: device1StubInfo.deviceId,
        topics: device1StubInfo.deviceTopics.name,
      };

      await expect(
        service.removeDeviceTopics(
          input.requesterId,
          input.deviceId,
          input.topics,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
