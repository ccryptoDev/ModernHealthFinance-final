import { Test, TestingModule } from '@nestjs/testing';
import { LoanoffersController } from './loanoffers.controller';
import { LoanoffersService } from './loanoffers.service';

describe('LoanoffersController', () => {
  let controller: LoanoffersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanoffersController],
      providers: [LoanoffersService],
    }).compile();

    controller = module.get<LoanoffersController>(LoanoffersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
