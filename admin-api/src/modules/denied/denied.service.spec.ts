import { Test, TestingModule } from '@nestjs/testing';
import { DeniedService } from './denied.service';

describe('DeniedService', () => {
  let service: DeniedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeniedService],
    }).compile();

    service = module.get<DeniedService>(DeniedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
