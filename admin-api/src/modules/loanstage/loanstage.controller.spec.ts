import { Test, TestingModule } from '@nestjs/testing';
import { LoanstageController } from './loanstage.controller';
import { LoanstageService } from './loanstage.service';

describe('LoanstageController', () => {
  let controller: LoanstageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanstageController],
      providers: [LoanstageService],
    }).compile();

    controller = module.get<LoanstageController>(LoanstageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
