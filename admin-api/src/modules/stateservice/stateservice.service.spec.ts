import { Test, TestingModule } from '@nestjs/testing';
import { StateserviceService } from './stateservice.service';

describe('StateserviceService', () => {
  let service: StateserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StateserviceService],
    }).compile();

    service = module.get<StateserviceService>(StateserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
