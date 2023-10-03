import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEmployeeDTO } from 'src/dtos/create-employee.dto';
import { UtilsService } from 'src/utils/utils.service';
import { Any, Repository } from 'typeorm';
import { Request } from 'express';
import { EGender } from 'src/enums/EGender.enum';
import { UUID } from 'crypto';
import { UpdateEmployeeDTO } from '../dtos/update-employee.dto';
import { CompanyService } from 'src/company/company.service';
import { RoleService } from 'src/roles/roles.service';
import { ERole } from 'src/enums/ERole.enum';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { generate } from 'otp-generator';
import { Address } from 'src/entities/address.entity';
import { AddressService } from 'src/address/address.service';
import { EActionType } from 'src/enums/EActionType.enum';
import { MainUser } from 'src/entities/MainUser.entity';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { EUserType } from 'src/enums/EUserType.enum';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { Organization } from 'src/entities/organization.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { Console } from 'console';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(MiningCompanyEmployee)
    public employeeRepo: Repository<MiningCompanyEmployee>,
    @InjectRepository(RMBEmployee)
    public rmbEmployeeRepo: Repository<RMBEmployee>,
    @InjectRepository(RescueTeamEmployee)
    public rescueTeamEmployeeRepo: Repository<RescueTeamEmployee>,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,

    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    private roleService: RoleService,
    private addressService: AddressService,
    private rescueTeamService: RescueTeamsService,
  ) {}

  async createEmployee(req: Request, dto: CreateEmployeeDTO) {
    let emp: MiningCompanyEmployee;
    let company: any;
    let companyAdmin: any;
    let address: Address;
    let employee: any;
    try {
      let gender;
      switch (dto.myGender.toUpperCase()) {
        case 'MALE':
          gender = EGender.MALE;
          break;
        case 'FEMALE':
          gender = EGender.FEMALE;
          break;
        case 'OTHER':
          gender = EGender.OTHER;
          break;
        default:
          throw new BadRequestException('The provided gender is invalid');
      }

      const hashedPassword = await this.utilsService.hashString(dto.password);
      let otp = generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      switch (dto.employeeType.toUpperCase()) {
        case EUserType[EUserType.MINING_COMPANY_EMPLOYEE]:
          const availableEmployee = await this.employeeRepo.findOne({
            where: { email: dto.email },
          });
          if (availableEmployee) {
            throw new BadRequestException(
              'The employee with the provided email is already registered',
            );
          }
          emp = new MiningCompanyEmployee(
            dto.firstName,
            dto.lastName,
            dto.email,
            gender,
            dto.national_id,
            dto.phoneNumber,
            hashedPassword,
            EAccountStatus.WAITING_EMAIL_VERIFICATION,
            this.utilsService.generateRandomFourDigitNumber(),
          );
          companyAdmin = await this.utilsService.getLoggedInProfile(
            req,
            'company',
          );
          await this.employeeRepo.save(companyAdmin);
          company = await this.companyService.getCompanyById(
            companyAdmin.company.id,
          );
          emp.company = company;

          if (
            dto.employeeRole.toUpperCase() != EEmployeeType[EEmployeeType.ADMIN]
          ) {
            emp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.COMPANY_EMPLOYEE],
            ]);
          } else {
            emp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.COMPANY_ADMIN],
            ]);
          }

          address = await this.addressService.createAddress(dto.address);
          emp.address = address;
          await this.employeeRepo.save(emp);

          delete emp.password;
          return await this.employeeRepo.findOne({
            where: { email: emp.email },
            relations: ['roles', 'company'],
          });
        case EUserType[EUserType.RMB_EMPLOYEE]:
          let rmbEmp = new RMBEmployee(
            dto.firstName,
            dto.lastName,
            dto.email,
            gender,
            dto.national_id,
            dto.phoneNumber,
            hashedPassword,
            Number(otp),
          );
          address = await this.addressService.createAddress(dto.address);
          rmbEmp.address = address;
          if (
            dto.employeeType.toUpperCase() != EEmployeeType[EEmployeeType.ADMIN]
          ) {
            rmbEmp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.COMPANY_EMPLOYEE],
            ]);
          } else {
            rmbEmp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.COMPANY_ADMIN],
            ]);
          }
          await this.employeeRepo.save(rmbEmp);

          return await this.employeeRepo.findOne({
            where: { email: rmbEmp.email },
            relations: ['roles', 'company'],
          });

        case EUserType[EUserType.RESCUE_TEAM_EMPLOYEE]:
          let rescueTeamEmp: RescueTeamEmployee = new RescueTeamEmployee(
            dto.firstName,
            dto.lastName,
            dto.email,
            gender,
            dto.national_id,
            dto.phoneNumber,
            hashedPassword,
            Number(otp),
          );
          address = await this.addressService.createAddress(dto.address);
          employee = await this.utilsService.getLoggedInProfile(
            req,
            'rescue_team',
          );

          company = this.rescueTeamService.rescueTeamRepo.findOne({
            where: { id: company.rescueTeam.id },
          });
          emp.address = address;
          rescueTeamEmp.rescueTeam = company;

          if (
            dto.employeeType.toUpperCase() != EEmployeeType[EEmployeeType.ADMIN]
          ) {
            emp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.COMPANY_EMPLOYEE],
            ]);
          } else {
            emp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.COMPANY_ADMIN],
            ]);
          }
          await this.employeeRepo.save(emp);

          return await this.employeeRepo.findOne({
            where: { email: rescueTeamEmp.email },
            relations: ['roles', 'company'],
          });
        default:
          throw new BadRequestException('The provided user type is invalid');
      }
    } catch (error) {
      console.error('Error creating employee: ', error);
      throw error;
    }
  }

  addCompanies(user: MiningCompanyEmployee, company: MiningCompany) {
    if (!user || !company)
      throw new BadRequestException('The company or user should not be');
    let companies: MiningCompany[] = [];
    // companies = user.companies;
    companies.push(company);
    // user.companies = companies;
    return user;
  }
  async approveAndRejectEmp(id: UUID, action: string) {
    let employee = await this.employeeRepo.findOneBy({
      id,
    });

    console.log(id);

    console.log(employee);

    // if (employee.status != EActionType[EAccountStatus.ACTIVE]) {
    //   throw new BadRequestException('The Account has not yet been verified!');
    // }
    switch (action.toUpperCase()) {
      case EActionType[EActionType.APPROVE]:
        employee.status = EAccountStatus[EAccountStatus.APPROVED];
        break;
      case EActionType[EActionType.REJECT]:
        employee.status = EAccountStatus[EAccountStatus.REJECTED];
    }
    return this.employeeRepo.save(employee);
  }

  async createEmp(employee: MainUser) {
    const availableEmployee = await this.employeeRepo.findOne({
      where: { email: employee.email },
    });

    if (availableEmployee) {
      throw new BadRequestException(
        'The employee with the provided email is already registered',
      );
    }

    employee.password = await this.utilsService.hashString(employee.password);
    let createdEmployee = await this.employeeRepo.save(employee);
    delete createdEmployee.password;
    console.log(
      await this.employeeRepo.findOne({
        where: { email: createdEmployee.email },
        relations: ['roles'],
      }),
    );
    delete createdEmployee.password;
    delete createdEmployee.activationCode;
    return createdEmployee;
  }

  async updateEmployee(dto: UpdateEmployeeDTO) {
    let availalbleUser = await this.getEmployeeByEmail(dto.id);
    let gender;
    switch (dto.myGender.toUpperCase()) {
      case 'MALE':
        gender = EGender[EGender.MALE];
        break;
      case 'FEMALE':
        gender = EGender[EGender.FEMALE];
        break;
      case 'OTHER':
        gender = EGender[EGender.OTHER];
        break;
      default:
        throw new BadRequestException('The provided gender is invalid');
    }
    const hashedPassword = await this.utilsService.hashString(dto.password);
    let otp = generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const emp: MiningCompanyEmployee = new MiningCompanyEmployee(
      dto.firstName,
      dto.lastName,
      dto.email,
      gender,
      dto.national_id,
      dto.phoneNumber,
      hashedPassword,
      Number(otp),
      this.utilsService.generateRandomFourDigitNumber(),
    );
    let updatedUser = Object.assign(availalbleUser, dto);
    let createdEmployee = await this.employeeRepo.save(updatedUser);
    delete createdEmployee.password;
    delete createdEmployee.activationCode;
    delete createdEmployee.status;
    return createdEmployee;
  }

  async getEmployeeByEmail(email: any) {
    const isEmployeeAvailable = await this.employeeRepo.findOne({
      where: {
        email: email,
      },
      relations: ['roles'],
    });

    if (!isEmployeeAvailable)
      throw new NotFoundException(
        'The employee with the provided email is not found',
      );
    return isEmployeeAvailable;
  }

  async getEmployeeById(id: UUID) {
    const isEmployeeAvailable = await this.employeeRepo.findOne({
      where: { id: id },
      relations: ['company', 'roles', 'notifications'],
    });
    if (!isEmployeeAvailable)
      throw new NotFoundException(
        'The employee with the provided id is not found',
      );
    return isEmployeeAvailable;
  }

  async getEmployeesByLoggedInCompany(req: Request) {
    let employee: any = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    const employees = await this.employeeRepo.find({
      where: { company: employee.company },
    });
    let newEmployees: MiningCompanyEmployee[] = [];
    employees.forEach((employee) => {
      delete employee.password;
      delete employee.activationCode;
      delete employee.status;
      newEmployees.push(employee);
    });
    return newEmployees;
  }

  async getAllEmployees() {
    let employees = this.employeeRepo.find({});
    let newEmployees: MiningCompanyEmployee[] = [];
    (await employees).forEach((employee) => {
      delete employee.password;
      delete employee.activationCode;
      delete employee.status;
      newEmployees.push(employee);
    });
    return newEmployees;
  }
  async deleteAllEmployees() {
    return this.employeeRepo.delete({});
  }
  async deleteEmployeeById(id: UUID) {
    let employee = await this.getEmployeeById(id);
    this.employeeRepo.remove(employee);
  }

  // This api is optimized to be used to all types of employees
  async getMiningCompanyEmployeesByStatus(status: string) {
    switch (status.toUpperCase()) {
      case EActionType[EActionType.APPROVE] + 'D':
        return await this.employeeRepo.find({
          where: { status: EAccountStatus[EAccountStatus.APPROVED] },
        });
      case EActionType[EActionType.REJECT] + 'D':
        return await this.employeeRepo.find({
          where: { status: EAccountStatus[EAccountStatus.REJECTED] },
        });
      default:
        throw new BadRequestException('The provided action is invalid');
    }
  }

  async approveorRejectMiningCompanyEmployees(id: UUID, action: string) {
    let user: MainUser;
    switch (action.toUpperCase()) {
      case 'APPROVE':
        user = await this.getEmployeeById(id);
        if ((user.status = EAccountStatus[EAccountStatus.APPROVED]))
          throw new ForbiddenException('The employee is already approved');
        user.status = EAccountStatus[EAccountStatus.APPROVED];
        break;
      case 'REJECT':
        user = await this.getEmployeeById(id);
        if ((user.status = EAccountStatus[EAccountStatus.REJECTED]))
          throw new ForbiddenException('The employee is already rejected');
        user.status = EAccountStatus[EAccountStatus.REJECTED];
        break;
      default:
        throw new BadRequestException('The provided action is invalid');
    }
  }
}
