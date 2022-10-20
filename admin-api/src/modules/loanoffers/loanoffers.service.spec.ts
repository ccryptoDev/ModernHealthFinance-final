import { Test, TestingModule } from '@nestjs/testing';
import { LoanoffersService } from './loanoffers.service';

describe('LoanoffersService', () => {
  let service: LoanoffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanoffersService],
    }).compile();

    service = module.get<LoanoffersService>(LoanoffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
