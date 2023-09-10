import { Test, TestingModule } from '@nestjs/testing';
import { MineralService } from './mineral.service';

describe('MineralService', () => {
  let service: MineralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MineralService],
    }).compile();

    service = module.get<MineralService>(MineralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
