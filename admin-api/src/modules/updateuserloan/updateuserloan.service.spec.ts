import { Test, TestingModule } from '@nestjs/testing';
import { UpdateuserloanService } from './updateuserloan.service';

describe('UpdateuserloanService', () => {
  let service: UpdateuserloanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateuserloanService],
    }).compile();

    service = module.get<UpdateuserloanService>(UpdateuserloanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
