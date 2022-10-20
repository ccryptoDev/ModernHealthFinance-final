import { Test, TestingModule } from '@nestjs/testing';
import { MailcontrollersController } from './mailcontrollers.controller';
import { MailcontrollersService } from './mailcontrollers.service';

describe('MailcontrollersController', () => {
  let controller: MailcontrollersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailcontrollersController],
      providers: [MailcontrollersService],
    }).compile();

    controller = module.get<MailcontrollersController>(MailcontrollersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
