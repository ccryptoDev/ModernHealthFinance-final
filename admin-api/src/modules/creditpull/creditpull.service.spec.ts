import { Test, TestingModule } from '@nestjs/testing';
import { CreditpullService } from './creditpull.service';

describe('CreditpullService', () => {
  let service: CreditpullService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditpullService],
    }).compile();

    service = module.get<CreditpullService>(CreditpullService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
