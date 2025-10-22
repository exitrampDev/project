import { Test, TestingModule } from '@nestjs/testing';
import { DueDeliganceController } from './due-deligance.controller';

describe('DueDeliganceController', () => {
  let controller: DueDeliganceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DueDeliganceController],
    }).compile();

    controller = module.get<DueDeliganceController>(DueDeliganceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
