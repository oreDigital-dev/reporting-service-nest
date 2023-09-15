import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Request, Response } from 'express';
import { Exception } from 'handlebars';
import { AddressService } from 'src/address/address.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateMiningCompanyDTO } from 'src/dtos/create_mining-company.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { Address } from 'src/entities/address.entity';
import { Mineral } from 'src/entities/mineral.entity';
import { MiningCompany } from 'src/entities/mining-company.entity';
import { MiningCompanyEmployee } from 'src/entities/mining_company-employee';
import { EGender } from 'src/enums/EGender.enum';
import { EOrganizationType } from 'src/enums/EOrganizationType';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { ERole } from 'src/enums/ERole.enum';
import { MineralService } from 'src/mineral/mineral.service';
import { RoleService } from 'src/roles/roles.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
    @InjectRepository(MiningCompany)
    private companyRepo: Repository<MiningCompany>,
    private addressService: AddressService,
    @Inject(forwardRef(() => AuthService))
    private mineralService: MineralService,
    private roleService: RoleService,
  ) {}
  async createCompany(dto: CreateMiningCompanyDTO) {
    const available = await this.companyRepo.find({
      where: [
        {
          email: dto.company.email,
          phoneNumber: dto.company.phoneNumber,
        },
      ],
    });

    if (available.length != 0) {
      throw new BadRequestException(
        "The company's phone number or email or owner NID is already registered!",
      );
    }
    const hashedPassword = await this.utilsService.hashString(
      dto.companyAdmin.password,
    );

    let ownership: any = EOwnershipType[dto.company.ownership];
    let company: MiningCompany = new MiningCompany(
      dto.company.name,
      dto.company.email,
      dto.company.phoneNumber,
      dto.company.ownership,
      dto.company.numberOfEmployees,
      dto.company.licenseNumber,
    );

    let companyAddress: Address = await this.addressService.createAddress(
      dto.company.address,
    );
    company.address = companyAddress;

    let userAddress: Address = await this.addressService.createAddress(
      dto.companyAdmin.address,
    );
    let minerals: Mineral[] = [];

    for (let min of dto.company.minerals) {
      let mineral: Mineral = await this.mineralService.getMineralByName(
        min.toUpperCase(),
      );
      minerals.push(mineral);
    }
    const employee: MiningCompanyEmployee = new MiningCompanyEmployee(
      dto.companyAdmin.firstName,
      dto.companyAdmin.lastName,
      dto.companyAdmin.email,
      dto.companyAdmin.username,
      EGender[dto.companyAdmin.myGender.toUpperCase()],
      dto.companyAdmin.national_id,
      dto.companyAdmin.phoneNumber,
      0,
      dto.companyAdmin.password,
    );
    company.minerals = minerals;
    company.employees = [employee];

    const createdCompany = await this.companyRepo.save(company);
    employee.organizationType =
      EOrganizationType[EOrganizationType.MINING_COMPANY];
    const role = await this.roleService.getRoleByName(
      ERole[ERole.COMPANY_ADMIN],
    );
    const createdEmployee = await this.employeeService.createEmp(employee);
    const tokens = await this.utilsService.getTokens(createdEmployee);
    // delete createdCompany.password;
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: createdEmployee,
    };
  }

  async saveCompany(company: MiningCompany) {
    return this.companyRepo.save(company);
  }

  async getCompanyById(id: UUID) {
    try {
      const isCompanyAvailable = await this.companyRepo.findOne({
        where: { id: id },
        relations: ['employees', 'notifications', 'address'],
      });

      if (isCompanyAvailable == null)
        throw new NotFoundException(
          'The company with the provided id is not found',
        );
      return isCompanyAvailable;
    } catch (err) {
      throw new Exception(err);
    }
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
        relations: ['employees', 'mineSites'],
      });
    } catch (error) {
      throw error;
    }
  }
  async deleteCompany(id: UUID) {
    try {
      await this.companyRepo.delete({
        id,
      });
      return { message: 'Company account successfully deleted!' };
    } catch (err) {
      throw new Exception(err);
    }
  }

  async getCompanyProfile(req: Request, res: Response) {
    try {
      let owner: any = await this.utilsService.getLoggedInProfile(req, res);
      return this.companyRepo.findOne({ where: { email: owner.email } });
    } catch (err) {
      throw new Exception(err);
    }
  }
}
