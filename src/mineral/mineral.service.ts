import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CreateMineralDTO } from 'src/dtos/create-mineral.dto';
import { Mineral } from 'src/entities/mineral.entity';
import { EMineralName } from 'src/enums/EMineralName.enum';
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

  async getMineralByName(name: string) {
    try {
      const mineral = await this.mineralRepo.findOne({
        where: {
          name: name,
        },
      });
      return mineral;
    } catch (error) {
      throw error;
    }
  }

  async getAllMinerals() {
    return await this.mineralRepo.find({});
  }

  async getMineralById(id:UUID){
    return await this.mineralRepo.findOneBy({
      id
    })
  }

  async createMinera() {
    const mineralNames = [
      EMineralName[EMineralName.COAL],
      EMineralName[EMineralName.DIAMOND],
      EMineralName[EMineralName.GOLD],
      EMineralName[EMineralName.ZINC],
    ];
    mineralNames.forEach(async (name) => {
      const mineral = await this.getMineralByName(name);
      if (!mineral || mineral != null) {
        await this.mineralRepo.save(new Mineral(name, '', ''));
      }
    });
  }
  
}
