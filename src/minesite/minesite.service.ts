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
import { MineSite } from 'src/entities/minesite.entity';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { Address } from 'src/entities/address.entity';

@Injectable()
export class MinesiteService {
  constructor(
    @InjectRepository(MineSite) public mineSiteRepo: Repository<MineSite>,
    private addressService: AddressService,
    private companyService: CompanyService,
    private utilService: UtilsService,
  ) {}

  async createMineSite(dto: createMineSiteDTO, req: Request, res: Response) {
    let mineSite: MineSite = new MineSite(dto.name);
    const owner: any = await this.utilService.getLoggedInProfile(req, res);
    const company: any = await this.companyService.getCompanyByEmail(
      owner.email,
    );
    let isAvailable = await this.mineSiteRepo.findOne({
      where: {
        name: dto.name,
        // company: company,
      },
    });
    console.log(isAvailable);
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
    console.log(address);
    mineSite.address = address;
    return this.mineSiteRepo.save(mineSite);
  }

  async getMineSiteById(id: UUID) {
    let minesite = await this.mineSiteRepo.findOneBy({
      id,
    });

    if (minesite == null) {
      throw new NotFoundException('Minesite not found!');
    }
    return minesite;
  }
}
