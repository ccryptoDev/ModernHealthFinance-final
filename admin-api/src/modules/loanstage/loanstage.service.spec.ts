import { Test, TestingModule } from '@nestjs/testing';
import { LoanstageService } from './loanstage.service';

describe('LoanstageService', () => {
  let service: LoanstageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanstageService],
    }).compile();

    service = module.get<LoanstageService>(LoanstageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
