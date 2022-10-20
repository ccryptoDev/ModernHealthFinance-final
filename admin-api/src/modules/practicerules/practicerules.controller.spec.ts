import { Test, TestingModule } from '@nestjs/testing';
import { PracticerulesController } from './practicerules.controller';
import { PracticerulesService } from './practicerules.service';

describe('PracticerulesController', () => {
  let controller: PracticerulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PracticerulesController],
      providers: [PracticerulesService],
    }).compile();

    controller = module.get<PracticerulesController>(PracticerulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
