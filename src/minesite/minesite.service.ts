import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressService } from 'src/address/address.service';
import { CompanyService } from 'src/company/company.service';
import { createMineSiteDTO } from 'src/dtos/create-minesite.dto';
import { MineSite } from 'src/entities/minesite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MinesiteService {
  constructor(
    @InjectRepository(MineSite) public mineSiteRepo: Repository<MineSite>,
    private addressService: AddressService,
    private companyService: CompanyService,
  ) {}

  async createMineSite(dto: createMineSiteDTO) {
    let mineSite: MineSite = new MineSite();
    let isAvailable = this.mineSiteRepo.findBy({
      name: dto.name,
    });
    if (isAvailable)
      throw new BadRequestException(`${name} minesite is already registered!`);
    // const company = await this.companyService.getCompanyById(dto.companyId);
    // mineSite.company = company;
    // const address = this.addressService.findById(dto.addressId);
  }
}
