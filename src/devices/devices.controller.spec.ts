import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

describe('DevicesController', () => {
  let controller: DevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
    })
      .useMocker((token) => {
        if (token === DevicesService) {
          return {
            register: jest.fn().mockResolvedValue('Register Received'),
            unregister: jest.fn().mockResolvedValue('Unregister Received'),
            getDevicesList: jest
              .fn()
              .mockResolvedValue('Get Devices List Received'),
            addDeviceTopics: jest
              .fn()
              .mockResolvedValue('Add Device Topic Received'),
            removeDeviceTopics: jest
              .fn()
              .mockResolvedValue('Remove Device Topic Received'),
          };
        }
      })
      .compile();

    controller = module.get<DevicesController>(DevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /register', () => {
    it('should pass requster and device info to DevicesService.register', async () => {
      expect(
        await controller.register(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          {
            device_name: 'device1',
            device_topics: ['topic1'],
          },
        ),
      ).toEqual('Register Received');
    });
  });

  describe('DELETE /unregister', () => {
    it('should pass requster and target device id to DevicesService.unregister', async () => {
      expect(
        await controller.unregister(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          1,
        ),
      ).toEqual('Unregister Received');
    });
  });

  describe('GET /list', () => {
    it('should pass requster id to DevicesService.getDevicesList', async () => {
      expect(
        await controller.list({
          user: {
            username: 'user1',
            sub: 1,
          },
        }),
      ).toEqual('Get Devices List Received');
    });
  });

  describe('POST /topics', () => {
    it('should pass requster id, target device id and topics to DevicesService.addDeviceTopics', async () => {
      expect(
        await controller.addTopic(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          ['topic1'],
          1,
        ),
      ).toEqual('Add Device Topic Received');
    });
  });

  describe('DELETE /topics', () => {
    it('should pass requster id, target device id and topics to DevicesService.removeDeviceTopics', async () => {
      expect(
        await controller.removeTopic(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          ['topic1'],
          1,
        ),
      ).toEqual('Remove Device Topic Received');
    });
  });
});
