import { Test, TestingModule } from '@nestjs/testing';
import { MinesiteController } from './minesite.controller';

describe('MinesiteController', () => {
  let controller: MinesiteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinesiteController],
    }).compile();

    controller = module.get<MinesiteController>(MinesiteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
