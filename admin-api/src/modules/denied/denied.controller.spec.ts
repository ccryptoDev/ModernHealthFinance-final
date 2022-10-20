import { Test, TestingModule } from '@nestjs/testing';
import { DeniedController } from './denied.controller';
import { DeniedService } from './denied.service';

describe('DeniedController', () => {
  let controller: DeniedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeniedController],
      providers: [DeniedService],
    }).compile();

    controller = module.get<DeniedController>(DeniedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
