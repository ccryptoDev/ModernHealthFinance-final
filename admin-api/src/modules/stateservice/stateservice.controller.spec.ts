import { Test, TestingModule } from '@nestjs/testing';
import { StateserviceController } from './stateservice.controller';
import { StateserviceService } from './stateservice.service';

describe('StateserviceController', () => {
  let controller: StateserviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StateserviceController],
      providers: [StateserviceService],
    }).compile();

    controller = module.get<StateserviceController>(StateserviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
