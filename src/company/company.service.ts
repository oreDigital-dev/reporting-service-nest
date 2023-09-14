import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEmail } from 'class-validator';
import { UUID } from 'crypto';
import { Request, Response } from 'express';
import { Exception } from 'handlebars';
import { AddressService } from 'src/address/address.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { Address } from 'src/entities/address.entity';
import { Employee } from 'src/entities/employee.enity';
import { Mineral } from 'src/entities/mineral.entity';
import { MiningCompany } from 'src/entities/mining-company.entity';
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
    private authService: AuthService,
    private mineralService: MineralService,
    private roleService: RoleService,
  ) {}
  async createCompany(dto: CreateCompanyDTO) {
    const available = await this.companyRepo.find({
      where: [
        {
          email: dto.email,
          phoneNumber: dto.phoneNumber,
        },
      ],
    });

    if (available.length != 0) {
      throw new BadRequestException(
        "The company's phone number or email or owner NID is already registered!",
      );
    }
    const hashedPassword = await this.utilsService.hashString(dto.password);

    let ownership: any = EOwnershipType[dto.ownership];
    let company: MiningCompany = new MiningCompany(
      dto.name,
      dto.email,
      // dto.licenseNumber,
      // dto.productionCapacity,
      dto.phoneNumber,
      // dto.ownerNID,
      // dto.numberOfEmployees,
      // ownership,
      // dto.password,
    );

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
    // employee.organizationType =
    //   EOrganizationType[EOrganizationType.MINING_COMPANY];
    // const role = await this.roleService.getRoleByName(
    //   ERole[ERole.COMPANY_ADMIN],
    // );
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
