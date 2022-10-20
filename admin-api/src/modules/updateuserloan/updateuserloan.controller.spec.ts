import { Test, TestingModule } from '@nestjs/testing';
import { UpdateuserloanController } from './updateuserloan.controller';
import { UpdateuserloanService } from './updateuserloan.service';

describe('UpdateuserloanController', () => {
  let controller: UpdateuserloanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateuserloanController],
      providers: [UpdateuserloanService],
    }).compile();

    controller = module.get<UpdateuserloanController>(UpdateuserloanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
