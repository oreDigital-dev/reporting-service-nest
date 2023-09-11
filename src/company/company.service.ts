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
import { EGender } from 'src/enums/EGender.enum';
import { EOrganizationType } from 'src/enums/EOrganizationType';
import { ERole } from 'src/enums/ERole.enum';
import { MailingService } from 'src/mailing/mailing.service';
import { RoleService } from 'src/roles/roles.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    private employeeService: EmployeeService,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    private addressService: AddressService,
    private authService: AuthService,
    private mailService: MailingService,
    private roleService: RoleService,
  ) {}
  async createCompany(dto: CreateCompanyDTO) {
    const available = await this.companyRepo.findOne({
      where: { email: dto.email },
    });
    // if (available)
    //   throw new BadRequestException(
    //     "The company's phone number or email or owner NID is already regstered!",
    //   );
    const hashedPassword = await this.utilsService.hashString(dto.password);
    let address: any = await this.addressService.saveAddress(
      new Address(
        dto.address.country,
        dto.address.province,
        dto.address.district,
        dto.address.sector,
        dto.address.cell,
        dto.address.village,
      ),
    );
    let ownershipTypes = ['PUBLIC', 'PRIVATE'];
    if (!ownershipTypes.includes(dto.ownership.toLocaleUpperCase()))
      throw new BadRequestException(
        'The provided ownership type is not supported',
      );
    let company: Company = new Company(
      dto.name,
      dto.email,
      dto.licenseNumber,
      dto.productionCapacity,
      dto.phoneNumber,
      dto.ownerNID,
      dto.numberOfEmployees,
      dto.ownership.toLocaleUpperCase(),
    );
    company.password = hashedPassword;
    company.address = address;

    let userToCreate: Employee = new Employee(
      '',
      '',
      dto.email,
      '',
      EGender.OTHER,
      '',
      '',
      0,
      `oreDigital@${new Date().getFullYear()}`,
    );
    userToCreate = await this.roleService.assignRoleToEmployee(
      ERole[ERole.COMPANY_OWNER],
      userToCreate,
    );
    userToCreate.organizationType =
      EOrganizationType[EOrganizationType.MINING_COMPANY];
    const createdCompany = await this.companyRepo.save(company);
    const createdUser = await this.employeeService.employeeRepo.save(
      userToCreate,
    );
    const updatedCompanyEntity = await this.companyRepo.save(company);
    const tokens = await this.utilsService.getTokens(createdUser);
    this.mailService.sendEmailToUser(
      createdCompany.email,
      'company-workspace-verification',
      'OreDigital company workspace verification',
    );
    delete createdUser.password;
    delete createdUser.companies;
    delete createdUser.notifications;
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      createdUser,
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
    return this.companyRepo.find({ relations: ['address', 'mineSites'] });
  }
}
