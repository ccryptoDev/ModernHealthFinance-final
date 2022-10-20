import { Test, TestingModule } from '@nestjs/testing';
import { StartapplicationService } from './startapplication.service';

describe('StartapplicationService', () => {
  let service: StartapplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StartapplicationService],
    }).compile();

    service = module.get<StartapplicationService>(StartapplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
