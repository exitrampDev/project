import { Test, TestingModule } from '@nestjs/testing';
import { BusinessListingController } from './business-listing.controller';

describe('BusinessListingController', () => {
  let controller: BusinessListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessListingController],
    }).compile();

    controller = module.get<BusinessListingController>(BusinessListingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
