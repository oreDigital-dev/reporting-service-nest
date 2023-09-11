import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMineralDTO } from 'src/dtos/create-mineral.dto';
import { Repository } from 'typeorm';

@Injectable()
export class MineralService {
  constructor(
    @InjectRepository(Mineral) private mineralRepo: Repository<Mineral>,
  ) {}
  async createMineral(dto: CreateMineralDTO) {
    let mineral: Mineral = new Mineral(
      dto.name,
      dto.minralCode,
      dto.mineralDescription,
    );
    return await this.mineralRepo.save(mineral);
  }
}
