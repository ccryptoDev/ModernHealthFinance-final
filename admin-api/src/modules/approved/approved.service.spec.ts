import { Test, TestingModule } from '@nestjs/testing';
import { ApprovedService } from './approved.service';

describe('ApprovedService', () => {
  let service: ApprovedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovedService],
    }).compile();

    service = module.get<ApprovedService>(ApprovedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
