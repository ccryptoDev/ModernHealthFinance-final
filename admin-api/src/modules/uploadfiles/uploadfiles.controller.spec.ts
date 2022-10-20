import { Test, TestingModule } from '@nestjs/testing';
import { UploadfilesController } from './uploadfiles.controller';
import { UploadfilesService } from './uploadfiles.service';

describe('UploadfilesController', () => {
  let controller: UploadfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadfilesController],
      providers: [UploadfilesService],
    }).compile();

    controller = module.get<UploadfilesController>(UploadfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
