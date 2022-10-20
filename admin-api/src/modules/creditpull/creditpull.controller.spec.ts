import { Test, TestingModule } from '@nestjs/testing';
import { CreditpullController } from './creditpull.controller';
import { CreditpullService } from './creditpull.service';

describe('CreditpullController', () => {
  let controller: CreditpullController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditpullController],
      providers: [CreditpullService],
    }).compile();

    controller = module.get<CreditpullController>(CreditpullController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
