import { Test, TestingModule } from '@nestjs/testing';
import { CimController } from './cim.controller';

describe('CimController', () => {
  let controller: CimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CimController],
    }).compile();

    controller = module.get<CimController>(CimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
