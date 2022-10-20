import { Test, TestingModule } from '@nestjs/testing';
import { PromissoryNoteController } from './promissory-note.controller';
import { PromissoryNoteService } from './promissory-note.service';

describe('PromissoryNoteController', () => {
  let controller: PromissoryNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromissoryNoteController],
      providers: [PromissoryNoteService],
    }).compile();

    controller = module.get<PromissoryNoteController>(PromissoryNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
