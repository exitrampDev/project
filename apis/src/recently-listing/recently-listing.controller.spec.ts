import { Test, TestingModule } from '@nestjs/testing';
import { RecentlyListingController } from './recently-listing.controller';

describe('RecentlyListingController', () => {
  let controller: RecentlyListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentlyListingController],
    }).compile();

    controller = module.get<RecentlyListingController>(RecentlyListingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
