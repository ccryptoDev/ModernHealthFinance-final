import { Test, TestingModule } from '@nestjs/testing';
import { StartapplicationController } from './startapplication.controller';
import { StartapplicationService } from './startapplication.service';

describe('StartapplicationController', () => {
  let controller: StartapplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StartapplicationController],
      providers: [StartapplicationService],
    }).compile();

    controller = module.get<StartapplicationController>(StartapplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
