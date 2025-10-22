import { Test, TestingModule } from '@nestjs/testing';
import { DueDeliganceService } from './due-deligance.service';

describe('DueDeliganceService', () => {
  let service: DueDeliganceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DueDeliganceService],
    }).compile();

    service = module.get<DueDeliganceService>(DueDeliganceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
