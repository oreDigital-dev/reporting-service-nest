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
import { MiningCompanyEmployee } from 'src/entities/employee.entity';
import { Mineral } from 'src/entities/mineral.entity';
import { MiningCompany } from 'src/entities/mining-company.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EOrganizationStatus } from 'src/enums/EOrganizationStatus.enum';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { ERole } from 'src/enums/ERole.enum';
import { MailingService } from 'src/mailing/mailing.service';
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
        "The company's phone number or email is already registered!",
      );
    }

    let ownership: any = EOwnershipType[dto.company.ownership];
    let company: MiningCompany = new MiningCompany(
      dto.company.companyName,
      dto.company.email,
      dto.company.phoneNumber,
      dto.company.numberOfEmployees,
      ownership,
      dto.company.productionCapacity,
      dto.company.licenseNumber,
    );

    let companyAddress: Address = await this.addressService.createAddress(
      dto.company.address,
    );
    let adminAddress: Address = await this.addressService.createAddress(
      dto.companyAdmin.address,
    );
    let minerals: Mineral[] = [];

    for (let min of dto.company.minerals) {
      let mineral: Mineral = await this.mineralService.getMineralById(min);
      minerals.push(mineral);
    }

    const employee: MiningCompanyEmployee = new MiningCompanyEmployee(
      dto.companyAdmin.firstName,
      dto.companyAdmin.lastName,
      dto.companyAdmin.email,
      EGender[dto.companyAdmin.myGender],
      dto.companyAdmin.national_id,
      dto.companyAdmin.phoneNumber,
      dto.companyAdmin.password,
    );

    company.minerals = minerals;
    company.address = companyAddress;
    company.employees = [employee];
    company.status = EOrganizationStatus[EOrganizationStatus.PENDING];
    const createdCompany = await this.companyRepo.save(company);
    const adminRole = await this.roleService.getRoleByName(
      ERole[ERole.COMPANY_ADMIN],
    );

    employee.roles = [adminRole];
    employee.company = createdCompany;
    // employee.address = adminAddress;
    employee.role = ECompanyRole.ADMIN;
    await this.employeeService.createEmp(employee);
    // await this.m;
    return createdCompany;
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

  async getAllCompaniesByStatus(status: string) {
    // try {
    //   switch(status.)
    // } catch (error) {
    //   throw error;
    // }
  }
}
