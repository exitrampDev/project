import { Test, TestingModule } from '@nestjs/testing';
import { CimService } from './cim.service';

describe('CimService', () => {
  let service: CimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CimService],
    }).compile();

    service = module.get<CimService>(CimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
