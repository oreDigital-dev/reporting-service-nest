import { Test, TestingModule } from '@nestjs/testing';
import { MineralController } from './mineral.controller';

describe('MineralController', () => {
  let controller: MineralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MineralController],
    }).compile();

    controller = module.get<MineralController>(MineralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
