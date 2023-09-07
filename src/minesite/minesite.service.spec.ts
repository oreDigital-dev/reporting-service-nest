import { Test, TestingModule } from '@nestjs/testing';
import { MinesiteService } from './minesite.service';

describe('MinesiteService', () => {
  let service: MinesiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinesiteService],
    }).compile();

    service = module.get<MinesiteService>(MinesiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
