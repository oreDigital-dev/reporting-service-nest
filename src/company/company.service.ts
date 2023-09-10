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
import { Mineral } from 'src/entities/mineral.entity';
import { MineSite } from 'src/entities/minesite.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { MineralService } from 'src/mineral/mineral.service';
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
    private mineralService: MineralService
  ) { }
  async createCompany(dto: CreateCompanyDTO) {
    const available = await this.companyRepo.find({
      where: [
        {
          email: dto.email,
          ownerNID: dto.ownerNID,
          phoneNumber: dto.phoneNumber,
        },
      ]
    });

    if (available.length != 0) {
      throw new BadRequestException(
        "The company's phone number or email or owner NID is already registered!",
      );
    }
    const hashedPassword = await this.authService.hashPassword(dto.password);
    let ownership : any = EOwnershipType[dto.ownership]
    let company: Company = new Company(
      dto.name,
      dto.email,
      dto.licenseNumber,
      dto.productionCapacity,
      dto.phoneNumber,
      dto.ownerNID,
      dto.numberOfEmployees,
      ownership
    );
    company.password = hashedPassword;
    let address: Address = await this.addressService.createAddress(dto.address);

    company.address = address;
    
      let minerals : Mineral[] = [];

    for (let min of dto.minerals) {
      let mineral: Mineral = await this.mineralService.createMineral(min);
      minerals.push(mineral);
    }
    company.minerals = minerals;

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
