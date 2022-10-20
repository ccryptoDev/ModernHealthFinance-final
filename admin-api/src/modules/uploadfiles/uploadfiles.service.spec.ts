import { Test, TestingModule } from '@nestjs/testing';
import { UploadfilesService } from './uploadfiles.service';

describe('UploadfilesService', () => {
  let service: UploadfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadfilesService],
    }).compile();

    service = module.get<UploadfilesService>(UploadfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
