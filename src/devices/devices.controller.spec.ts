import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { DevicesDataService } from './data/data.service';

describe('DevicesController', () => {
  let controller: DevicesController;
  let service: DevicesService;
  let dataService: DevicesDataService;

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
            checkDeviceTopic: jest
              .fn()
              .mockResolvedValue('Check Device Topic Received'),
          };
        }
        if (token === DevicesDataService) {
          return {
            updateData: jest.fn().mockResolvedValue('Update Data Received'),
            getLatestData: jest
              .fn()
              .mockResolvedValue('Get Latest Data Received'),
            getPeriodicData: jest
              .fn()
              .mockResolvedValue('Get Periodic Data Received'),
          };
        }
      })
      .compile();

    controller = module.get<DevicesController>(DevicesController);
    service = module.get<DevicesService>(DevicesService);
    dataService = module.get<DevicesDataService>(DevicesDataService);
  });

  it('should define controller', () => {
    expect(controller).toBeDefined();
  });

  it('should define service', () => {
    expect(service).toBeDefined();
  });

  it('should define data service', () => {
    expect(dataService).toBeDefined();
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
      expect(service.register).toHaveBeenCalled();
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
      expect(service.unregister).toHaveBeenCalled();
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
      expect(service.getDevicesList).toHaveBeenCalled();
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
      expect(service.addDeviceTopics).toHaveBeenCalled();
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
      expect(service.removeDeviceTopics).toHaveBeenCalled();
    });
  });

  describe('POST /:device_id/:topic', () => {
    it('should pass requster id, target device id and topic to DevicesService.updateData', async () => {
      expect(
        await controller.updateValue(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          {
            payload: {
              timestamp: new Date().toISOString(),
              value: 1,
            },
          },
          1,
          'topic1',
        ),
      ).toEqual('Update Data Received');
      expect(service.checkDeviceTopic).toHaveBeenCalled();
      expect(dataService.updateData).toHaveBeenCalled();
    });
  });

  describe('GET /:device_id/:topic/latest', () => {
    it('should pass requster id, target device id and topic to DevicesService.getLatestData', async () => {
      expect(
        await controller.getLatestData(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          1,
          'topic1',
        ),
      ).toEqual('Get Latest Data Received');
      expect(service.checkDeviceTopic).toHaveBeenCalled();
      expect(dataService.getLatestData).toHaveBeenCalled();
    });
  });

  describe('GET /:device_id/:topic/periodic', () => {
    it('should pass requster id, target device id and topic to DevicesService.getPeriodicData', async () => {
      expect(
        await controller.getPeriodicData(
          {
            user: {
              username: 'user1',
              sub: 1,
            },
          },
          {
            from: new Date().toISOString(),
            to: new Date().toDateString(),
          },
          1,
          'topic1',
        ),
      ).toEqual('Get Periodic Data Received');
      expect(service.checkDeviceTopic).toHaveBeenCalled();
      expect(dataService.getPeriodicData).toHaveBeenCalled();
    });
  });
});
