import { Test, TestingModule } from '@nestjs/testing';
import { PendingController } from './pending.controller';
import { PendingService } from './pending.service';

describe('PendingController', () => {
  let controller: PendingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PendingController],
      providers: [PendingService],
    }).compile();

    controller = module.get<PendingController>(PendingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
