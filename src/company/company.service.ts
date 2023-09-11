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
import { EmployeeService } from 'src/employee/employee.service';
import { Address } from 'src/entities/address.entity';
import { Company } from 'src/entities/company.entity';
import { Employee } from 'src/entities/employee.enity';
import { Mineral } from 'src/entities/mineral.entity';
import { EGender } from 'src/enums/EGender.enum';
import { EOrganizationType } from 'src/enums/EOrganizationType';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { MineralService } from 'src/mineral/mineral.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    private addressService: AddressService,
    private authService: AuthService,
    private mineralService: MineralService,
  ) {}
  async createCompany(dto: CreateCompanyDTO) {
    const available = await this.companyRepo.find({
      where: [
        {
          email: dto.email,
          ownerNID: dto.ownerNID,
          phoneNumber: dto.phoneNumber,
        },
      ],
    });

    if (available.length != 0) {
      throw new BadRequestException(
        "The company's phone number or email or owner NID is already registered!",
      );
    }
    const hashedPassword = await this.authService.hashPassword(dto.password);
    let ownership: any = EOwnershipType[dto.ownership];
    let company: Company = new Company(
      dto.name,
      dto.email,
      dto.licenseNumber,
      dto.productionCapacity,
      dto.phoneNumber,
      dto.ownerNID,
      dto.numberOfEmployees,
      ownership,
    );
    company.password = hashedPassword;
    let address: Address = await this.addressService.createAddress(dto.address);

    company.address = address;
    let minerals: Mineral[] = [];

    for (let min of dto.minerals) {
      let mineral: Mineral = await this.mineralService.getMineralByName(
        min.toUpperCase(),
      );
      minerals.push(mineral);
    }

    const employee: Employee = new Employee(
      '',
      '',
      dto.email,
      '',
      EGender.OTHER,
      '',
      dto.phoneNumber,
      0,
      dto.password,
    );
    company.minerals = minerals;
    const createdCompany = await this.companyRepo.save(company);
    employee.password = createdCompany.password;
    employee.organizationType =
      EOrganizationType[EOrganizationType.MINING_COMPANY];
    const createdEmployee = await this.employeeService.createEmp(employee);
    const tokens = await this.utilsService.getTokens(createdEmployee);
    delete createdCompany.password;
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: createdEmployee,
    };
  }

  async getCompanyById(id: UUID) {
    const isCompanyAvailable = await this.companyRepo.findOne({
      where: { id: id },
      relations: ['employees', 'notifications', 'address'],
    });

    if (!isCompanyAvailable)
      throw new NotFoundException(
        'The company with the provided id is not found',
      );
    return isCompanyAvailable;
  }

  async getAllCompanies() {
    return this.companyRepo.find({
      relations: ['address', 'mineSites', 'minerals'],
    });
  }

  async getCompanyByEmail(email: string) {
    try {
      return await this.companyRepo.findOne({
        where: { email: email },
        relations: ['employees'],
      });
    } catch (error) {
      throw error;
    }
  }
}
