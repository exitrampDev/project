import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteListingService } from './favorite-listing.service';

describe('FavoriteListingService', () => {
  let service: FavoriteListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteListingService],
    }).compile();

    service = module.get<FavoriteListingService>(FavoriteListingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
