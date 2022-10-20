import { Test, TestingModule } from '@nestjs/testing';
import { IncompleteService } from './incomplete.service';

describe('IncompleteService', () => {
  let service: IncompleteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncompleteService],
    }).compile();

    service = module.get<IncompleteService>(IncompleteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
