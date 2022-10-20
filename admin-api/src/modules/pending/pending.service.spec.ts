import { Test, TestingModule } from '@nestjs/testing';
import { PendingService } from './pending.service';

describe('PendingService', () => {
  let service: PendingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendingService],
    }).compile();

    service = module.get<PendingService>(PendingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
