import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { AddressService } from 'src/address/address.service';
import { AuthService } from 'src/auth/auth.service';

import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { Address } from 'src/entities/address.entity';
import { Company } from 'src/entities/company.entity';
import { MineSite } from 'src/entities/minesite.entity';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(forwardRef(() => UtilsService))
    private userService: UtilsService,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    private addressService: AddressService,
    private authService: AuthService,
  ) {}
  async createCompany(dto: CreateCompanyDTO) {
    const available = await this.companyRepo.findBy([
      {
        email: dto.email,
        ownerNID: dto.ownerNID,
        phoneNumber: dto.phoneNumber,
      },
    ]);

    if (available)
      throw new BadRequestException(
        "The company's phone number or email or owner NID is already regstered!",
      );
    const hashedPassword = await this.authService.hashPassword(dto.password);
    let company: Company = new Company(
      dto.name,
      dto.email,
      dto.licenseNumber,
      dto.productionCapacity,
      dto.phoneNumber,
      dto.ownerNID,
      dto.numberOfEmployees,
      dto.ownership,
    );
    company.password = hashedPassword;
    // let address: Address = await this.addressService.findById(dto.addressId);
    // company.location =address;
    this.companyRepo.save(company);
  }

  async getCompanyById(id: UUID) {
    const isCompanyAvailable = await this.companyRepo.findOne({
      where: { id: id },
      relations: ['employees'],
    });

    if (!isCompanyAvailable)
      throw new NotFoundException(
        'The company with the provided id is not found',
      );
    return isCompanyAvailable;
  }
}
