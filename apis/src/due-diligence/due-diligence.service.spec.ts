import { Test, TestingModule } from '@nestjs/testing';
import { DueDiligenceService } from './due-diligence.service';

describe('DueDiligenceService', () => {
  let service: DueDiligenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DueDiligenceService],
    }).compile();

    service = module.get<DueDiligenceService>(DueDiligenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
