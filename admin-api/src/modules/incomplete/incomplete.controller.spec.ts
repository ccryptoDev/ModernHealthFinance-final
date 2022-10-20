import { Test, TestingModule } from '@nestjs/testing';
import { IncompleteController } from './incomplete.controller';
import { IncompleteService } from './incomplete.service';

describe('IncompleteController', () => {
  let controller: IncompleteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncompleteController],
      providers: [IncompleteService],
    }).compile();

    controller = module.get<IncompleteController>(IncompleteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
