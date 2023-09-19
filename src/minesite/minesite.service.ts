import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { AddressService } from 'src/address/address.service';
import { CompanyService } from 'src/company/company.service';
import { createMineSiteDTO } from 'src/dtos/create-minesite.dto';
import { Incident } from 'src/entities/incident.entity';
import { MineSite } from 'src/entities/minesite.entity';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { Address } from 'src/entities/address.entity';
import { UpdateMineSiteDTO } from 'src/dtos/update-minesite.dtp';
import { Mineral } from 'src/entities/mineral.entity';
import { MineralService } from 'src/mineral/mineral.service';
import { MiningCompany } from 'src/entities/miningCompany.entity';

@Injectable()
export class MinesiteService {
  constructor(
    @InjectRepository(MineSite) public mineSiteRepo: Repository<MineSite>,
    private addressService: AddressService,
    private companyService: CompanyService,
    private utilService: UtilsService,
    private mineralService: MineralService,
  ) {}

  async createMineSite(dto: createMineSiteDTO) {
    let mineSite: MineSite = new MineSite(dto.name);
    let company: any = await this.companyService.getCompanyById(dto.company);

    let isAvailable = await this.mineSiteRepo.findOne({
      where: {
        name: dto.name,
        company: company,
      },
    });
    if (isAvailable)
      throw new BadRequestException(
        `${mineSite.name} minesite is already registered!`,
      );
    const address = await this.addressService.addressRepo.save(
      new Address(
        dto.address.province,
        dto.address.district,
        dto.address.sector,
        dto.address.cell,
        dto.address.village,
      ),
    );
    let minerals: Mineral[] = [];
    for (let min of dto.minerals) {
      let mineral: Mineral = await this.mineralService.getMineralByName(
        min.toUpperCase(),
      );
      minerals.push(mineral);
    }
    mineSite.minerals = minerals;
    mineSite.address = address;
    mineSite.company = company;
    let mineSite2 = await this.mineSiteRepo.save(mineSite);    
    return mineSite2;
  }

  async getAllMineSite() {
    try {
      let sites = await this.mineSiteRepo.find({
        relations: ['minerals', 'company', 'address'],
      });
      return sites;
    } catch (error) {
      throw error;
    }
  }

  async getMinSitesOfLoggedCompany(req: Request) {

      const owner: any = await this.utilService.getLoggedInProfile(
        req,
        'company',
      );

      let minesites = await this.mineSiteRepo.find({
        where: { company: owner.company },
      });

      return minesites;

  }

  async getMinesitesByCompany(company : any) {
    try {
      let minesites = await this.mineSiteRepo.findBy({
        company: company
      });
      return minesites;
    } catch (error) {
      throw error;
    }
  }

  async getMineSiteById(id: any) {
    let minesite = await this.mineSiteRepo.findOne({
      where: {
        id: id,
      },
      relations: ['address', 'company', 'minerals'],
    });

    // if (minesite == null) {
    //   throw new NotFoundException('Minesite with that id is  not found!');
    // }
    return minesite;
  }

  async deleteMineSite(id: UUID) {
    try {
      const mineSite = await this.mineSiteRepo.findOne({ where: { id: id } });
      if (!mineSite)
        throw new NotFoundException(
          'Mine site with the provided id is not found',
        );

      await this.mineSiteRepo.remove(mineSite);
    } catch (error) {
      throw error;
    }
  }
  async deleteAllMineSitesInMyCompany(req: Request) {
    try {
      let owner: any = await this.utilService.getLoggedInProfile(
        req,
        'company',
      );
      let company: any = await this.companyService.getCompanyByEmail(
        owner.email,
      );

      let mineSites = await this.mineSiteRepo.find({
        where: { company: company },
      });
      mineSites.forEach(async (site) => {
        await this.mineSiteRepo.remove(site);
      });
    } catch (error) {
      throw error;
    }
  }
  async UpdateMineSite(dto: UpdateMineSiteDTO) {
    try {
      const availableMineSite = await this.getMineSiteById(dto.id);
      availableMineSite.name = dto.name;

      if (availableMineSite.address) {
        availableMineSite.address.district = dto.address.district;
        availableMineSite.address.sector = dto.address.sector;
        availableMineSite.address.cell = dto.address.cell;
        availableMineSite.address.village = dto.address.village;
        availableMineSite.address.province = dto.address.province;
      }
      await this.addressService.addressRepo.save(availableMineSite.address);
      return await this.mineSiteRepo.save(availableMineSite);
    } catch (error) {
      throw error;
    }
  }

}
