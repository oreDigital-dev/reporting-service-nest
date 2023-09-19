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
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { Address } from 'src/entities/address.entity';
import { Mineral } from 'src/entities/mineral.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { ERole } from 'src/enums/ERole.enum';
import { MineralService } from 'src/mineral/mineral.service';
import { RoleService } from 'src/roles/roles.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { generate } from 'otp-generator';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { EOrganizationStatus } from 'src/enums/EOrganizationStatus.enum';
import { MailingService } from 'src/mailing/mailing.service';
import { frontendAccountVerificationUrl } from 'src/utils/appData/constants';

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
    private mailingService: MailingService,
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

    let company: MiningCompany = new MiningCompany(
      dto.company.companyName,
      dto.company.email,
      dto.company.phoneNumber,
      dto.company.numberOfEmployees,
      EOwnershipType[dto.company.ownership],
      dto.company.productionCapacity,
      dto.company.licenseNumber,
    );

    let companyAddress: Address = await this.addressService.createAddress(
      dto.company.address,
    );
    let minerals: Mineral[] = [];

    for (let min of dto.company.minerals) {
      let mineral: Mineral = await this.mineralService.getMineralById(min);
      minerals.push(mineral);
    }
    company.minerals = minerals;
    company.address = companyAddress;

    const employee: MiningCompanyEmployee = new MiningCompanyEmployee(
      dto.companyAdmin.firstName,
      dto.companyAdmin.lastName,
      dto.companyAdmin.email,
      EGender[dto.companyAdmin.myGender],
      dto.companyAdmin.national_id,
      dto.companyAdmin.phoneNumber,
      dto.companyAdmin.password,
      Number(
        generate(6, {
          digits: true,
          lowerCaseAlphabets: false,
          upperCaseAlphabets: false,
          specialChars: false,
        }),
      ),
      ECompanyRole[ECompanyRole.ADMIN],
    );

    let adminAddress: Address = await this.addressService.createAddress(
      dto.companyAdmin.address,
    );
    const role = [];
    role.push(await this.roleService.getRoleByName(ERole[ERole.COMPANY_ADMIN]));

    employee.roles = role;
    employee.address = adminAddress;

    const createdCompany = await this.companyRepo.save(company);
    employee.company = createdCompany;
    employee.activationCode =
      await this.utilsService.generateRandomFourDigitNumber();
    const createdEm = await this.employeeService.createEmp(employee);
    await this.mailingService.sendEmail(
      createdEm.email,
      createdEm.lastName,
      createdEm.activationCode,
      frontendAccountVerificationUrl,
      false,
    );
    // await this.mailingService.sendPhoneSMSTOUser(
    //   employee.phonenumber,
    //   `Thank you for creating a work space at OreDigital , your account verification code is ${employee.activationCode.toString()}`,
    // );
    return createdCompany;
  }

  async saveCompany(company: MiningCompany) {
    return await this.companyRepo.save(company);
  }

  async getCompanyById(id: UUID) {
    try {
      const isCompanyAvailable = await this.companyRepo.findOne({
        where: { id: id },
        relations: ['notifications', 'address'],
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
      relations: ['address', 'minerals'],
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
      let owner: any = await this.utilsService.getLoggedInProfile(
        req,
        res,
        'company',
      );
      return this.companyRepo.findOne({ where: { email: owner.email } });
    } catch (err) {
      throw new Exception(err);
    }
  }

  async approveOrRejectCompany(action: string, id: UUID) {
    const availableCompany = await this.companyRepo.findOne({
      where: { id: id },
    });

    if (!availableCompany)
      throw new NotFoundException(
        'The company with the provided id is not found',
      );
    switch (action.toUpperCase()) {
      case 'APPROVE':
        availableCompany.status =
          EOrganizationStatus[EOrganizationStatus.APPROVED];
        // await this.mailingService.sendPhoneSMSTOUser(
        //   availableCompany.email,
        //   `Hello ${availableCompany.name} we are proudly appy to let you know that your request to register as company was approved by RMB.!! happy reducing the risk and improve productivity`,
        // );`
        break;
      case 'REJECT':
        availableCompany.status =
          EOrganizationStatus[EOrganizationStatus.REJECTED];
        // await this.mailingService.sendPhoneSMSTOUser(
        //   availableCompany.email,
        //   `Hello ${availableCompany.name} we are kindly regretting  to let you know that your request to register as company was rejected by RMB due to different parameter .!! happy reducing the risk and improve productivity`,
        // );
        break;
      default:
        throw new BadRequestException(
          'The provided action is invalid. it should be among [reject, approve]',
        );
    }
    return await this.companyRepo.save(availableCompany);
  }

  async getCompaniesByStatus(status: string) {
    let companies;
    switch (status.toString().toUpperCase()) {
      case 'REJECTED':
        companies = await this.companyRepo.find({
          where: { status: EOrganizationStatus[EOrganizationStatus.REJECTED] },
        });
        break;
      case 'APPROVED':
        companies = await this.companyRepo.find({
          where: { status: EOrganizationStatus[EOrganizationStatus.APPROVED] },
        });
        break;
      case 'PENDING':
        companies = await this.companyRepo.find({
          where: { status: EOrganizationStatus[EOrganizationStatus.PENDING] },
        });
        break;
      default:
        throw new BadRequestException('The provided status is not valid');
    }
    return companies;
  }

  async addEmployee(emp: MiningCompanyEmployee, id: UUID) {
    let company = await this.companyRepo.findOneBy({
      id: id,
    });
    let employees = company.employees;
    employees.push(emp);
    emp.company = company;
    this.employeeService.employeeRepo.save(emp);
    return this.companyRepo.save(company);
  }
}
