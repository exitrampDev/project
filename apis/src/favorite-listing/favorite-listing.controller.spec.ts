import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteListingController } from './favorite-listing.controller';

describe('FavoriteListingController', () => {
  let controller: FavoriteListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteListingController],
    }).compile();

    controller = module.get<FavoriteListingController>(FavoriteListingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
