import { Test, TestingModule } from '@nestjs/testing';
import { DueDiligenceController } from './due-diligence.controller';

describe('DueDiligenceController', () => {
  let controller: DueDiligenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DueDiligenceController],
    }).compile();

    controller = module.get<DueDiligenceController>(DueDiligenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
