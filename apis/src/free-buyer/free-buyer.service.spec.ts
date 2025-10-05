import { Test, TestingModule } from '@nestjs/testing';
import { FreeBuyerService } from './free-buyer.service';

describe('FreeBuyerService', () => {
  let service: FreeBuyerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreeBuyerService],
    }).compile();

    service = module.get<FreeBuyerService>(FreeBuyerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
