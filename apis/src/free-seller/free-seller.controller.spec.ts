import { Test, TestingModule } from '@nestjs/testing';
import { FreeSellerController } from './free-seller.controller';

describe('FreeSellerController', () => {
  let controller: FreeSellerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreeSellerController],
    }).compile();

    controller = module.get<FreeSellerController>(FreeSellerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
