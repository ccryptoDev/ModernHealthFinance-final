import { Test, TestingModule } from '@nestjs/testing';
import { MailcontrollersService } from './mailcontrollers.service';

describe('MailcontrollersService', () => {
  let service: MailcontrollersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailcontrollersService],
    }).compile();

    service = module.get<MailcontrollersService>(MailcontrollersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
