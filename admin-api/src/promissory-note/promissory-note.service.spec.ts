import { Test, TestingModule } from '@nestjs/testing';
import { PromissoryNoteService } from './promissory-note.service';

describe('PromissoryNoteService', () => {
  let service: PromissoryNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromissoryNoteService],
    }).compile();

    service = module.get<PromissoryNoteService>(PromissoryNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
