import { Test, TestingModule } from '@nestjs/testing';
import { DevicesDataService } from './data.service';

describe('DeviceDataService', () => {
  let service: DevicesDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevicesDataService],
    }).compile();

    service = module.get<DevicesDataService>(DevicesDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
