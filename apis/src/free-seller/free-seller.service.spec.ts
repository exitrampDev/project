import { Test, TestingModule } from '@nestjs/testing';
import { FreeSellerService } from './free-seller.service';

describe('FreeSellerService', () => {
  let service: FreeSellerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreeSellerService],
    }).compile();

    service = module.get<FreeSellerService>(FreeSellerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
