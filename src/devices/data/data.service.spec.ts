import { Test, TestingModule } from '@nestjs/testing';
import { DevicesDataService } from './data.service';
import { getModelToken } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { Data } from './schemas/data.schema';
import { NotFoundException } from '@nestjs/common';

describe('DeviceDataService', () => {
  let service: DevicesDataService;
  let model: Model<Data>;

  let mockFindSortLimitExec = [];
  let mockFindSortExce = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesDataService,
        {
          provide: getModelToken('Data', 'devices'),
          useValue: {
            find: jest.fn().mockImplementation(() => ({
              sort: jest.fn().mockImplementation(() => ({
                limit: jest.fn().mockImplementation(() => ({
                  exec: jest
                    .fn()
                    .mockImplementation(() =>
                      Promise.resolve(mockFindSortLimitExec),
                    ),
                })),
                exec: jest
                  .fn()
                  .mockImplementation(() => Promise.resolve(mockFindSortExce)),
              })),
            })),
            create: jest.fn().mockResolvedValue({}),
            insertMany: jest.fn().mockResolvedValue([]),
            sort: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<DevicesDataService>(DevicesDataService);
    model = module.get<Model<Data>>(getModelToken('Data', 'devices'));
    jest
      .spyOn(Document.prototype, 'toObject')
      .mockImplementation(() => ({}) as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateData', () => {
    it('should update single data if input values is a number', async () => {
      const mockData = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 1,
      };
      jest.spyOn(model, 'create').mockResolvedValueOnce({
        toObject: () => mockData,
      } as any);
      expect(
        await service.updateData(
          mockData.metadata.device_id,
          mockData.metadata.topic,
          mockData.value,
        ),
      ).toEqual(mockData);
    });

    it('should update single data if input values is an array with a single number', async () => {
      const mockData = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 2,
      };
      jest.spyOn(model, 'create').mockResolvedValueOnce({
        toObject: () => mockData,
      } as any);
      expect(
        await service.updateData(
          mockData.metadata.device_id,
          mockData.metadata.topic,
          [mockData.value],
        ),
      ).toEqual(mockData);
    });

    it('should update multiple data if input values is an array with multiple numbers', async () => {
      const mockData1 = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 2,
      };
      const mockData2 = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 3,
      };
      const mockData = [
        {
          toObject: () => mockData1,
        },
        {
          toObject: () => mockData2,
        },
      ];
      jest.spyOn(model, 'insertMany').mockResolvedValueOnce(mockData as any);
      expect(
        await service.updateData(
          mockData1.metadata.device_id,
          mockData1.metadata.topic,
          [mockData1.value, mockData2.value],
        ),
      ).toEqual([mockData1, mockData2]);
    });
  });

  describe('getLatestData', () => {
    it('should return the lastest data', async () => {
      const mockData = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 2,
      };
      mockFindSortLimitExec = [
        {
          toObject: () => mockData,
        },
      ];
      expect(
        await service.getLatestData(
          mockData.metadata.device_id,
          mockData.metadata.topic,
        ),
      ).toEqual(mockData);
    });

    it('should throw not found if no data found', async () => {
      const mockData = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 2,
      };
      mockFindSortLimitExec = [];
      await expect(
        service.getLatestData(
          mockData.metadata.device_id,
          mockData.metadata.topic,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPeriodicData', () => {
    it('should return the data for the given time period', async () => {
      const from_past_min = 2;
      const to_past_min = 0;
      const date_from = new Date(Date.now() - 60000 * from_past_min);
      const date_to = new Date(Date.now() - 60000 * to_past_min);
      const mockData = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 2,
      };
      mockFindSortExce = [
        {
          toObject: () => mockData,
        },
      ];
      expect(
        await service.getPeriodicData(
          mockData.metadata.device_id,
          mockData.metadata.topic,
          date_from.toISOString(),
          date_to.toISOString(),
        ),
      ).toEqual([mockData]);
    });

    it('should throw not found if no data found for the given time period', async () => {
      const from_past_min = 2;
      const to_past_min = 0;
      const date_from = new Date(Date.now() - 60000 * from_past_min);
      const date_to = new Date(Date.now() - 60000 * to_past_min);
      const mockData = {
        timestamp: new Date(),
        metadata: {
          device_id: 1,
          topic: 'test',
        },
        value: 2,
      };
      mockFindSortExce = [];
      await expect(
        service.getPeriodicData(
          mockData.metadata.device_id,
          mockData.metadata.topic,
          date_from.toISOString(),
          date_to.toISOString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
