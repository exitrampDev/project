import { Test, TestingModule } from '@nestjs/testing';
import { FreeBuyerController } from './free-buyer.controller';

describe('FreeBuyerController', () => {
  let controller: FreeBuyerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreeBuyerController],
    }).compile();

    controller = module.get<FreeBuyerController>(FreeBuyerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
