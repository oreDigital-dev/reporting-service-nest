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
import { Repository } from 'typeorm';
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
import { PageOptionsDTO } from 'src/dtos/page-options.dto';
import { Order } from 'src/enums/Order.enum';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { EUserType } from 'src/enums/EUserType.enum';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { EEmployeeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';
import { CreatESelfEmployeeDTO } from 'src/dtos/create_self-employee.dto';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { Organization } from 'src/entities/organization.entity';
import { Role } from 'src/entities/role.entity';
import { EMPTY } from 'rxjs';
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

      let availableEmployee;
      switch (dto.employeeType.toUpperCase()) {
        case EUserType[EUserType.MINING_COMPANY_EMPLOYEE]:
          availableEmployee = await this.employeeRepo.findOne({
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
          availableEmployee = await this.rmbEmployeeRepo.findOne({
            where: { email: dto.email },
          });
          if (availableEmployee) {
            throw new BadRequestException(
              'The employee with the provided email is already registered',
            );
          }
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
              ERole[ERole.RMB_EMPLOYEE],
            ]);
          } else {
            rmbEmp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.RMB_ADMIN],
            ]);
          }
          await this.rmbEmployeeRepo.save(rmbEmp);

          let createdEmp = await this.rmbEmployeeRepo.findOne({
            where: { email: rmbEmp.email },
            relations: ['roles'],
          });

          return createdEmp;

        case EUserType[EUserType.RESCUE_TEAM_EMPLOYEE]:
          availableEmployee = await this.rescueTeamEmployeeRepo.findOne({
            where: { email: dto.email },
          });
          if (availableEmployee) {
            throw new BadRequestException(
              'The employee with the provided email is already registered',
            );
          }
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
            where: { id: employee.rescueTeam.id },
          });
          rescueTeamEmp.address = address;
          rescueTeamEmp.rescueTeam = company;

          if (
            dto.employeeType.toUpperCase() != EEmployeeType[EEmployeeType.ADMIN]
          ) {
            rescueTeamEmp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.RESCUE_TEAM_EMPLOYEE],
            ]);
          } else {
            rescueTeamEmp.roles = await this.roleService.getRolesByNames([
              ERole[ERole.RESCUE_TEAM_ADMIN],
            ]);
          }
          rescueTeamEmp.employeeStatus = EAccountStatus[EAccountStatus.PENDING];
          await this.rescueTeamEmployeeRepo.save(rescueTeamEmp);

          let createdEmployee = await this.rescueTeamEmployeeRepo.findOne({
            where: { email: rescueTeamEmp.email },
            relations: ['roles'],
          });
          return createdEmployee;
        default:
          throw new BadRequestException('The provided user type is invalid');
      }
    } catch (error) {
      throw error;
    }
  }

  async createSelfAccount(dto: CreatESelfEmployeeDTO) {
    let org: any = null;
    let address: Address = null;
    let availableEmployee: any;
    let roles: Role[];
    switch (dto.employeeType.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        availableEmployee = await this.employeeRepo.findOne({
          where: { email: dto.email },
        });
        if (availableEmployee)
          throw new BadRequestException('The employee already exists');

        address = await this.addressService.createAddress(dto.address);
        let employee: MiningCompanyEmployee = new MiningCompanyEmployee(
          dto.firstName,
          dto.lastName,
          dto.email,
          EGender[this.utilsService.getGender(dto.myGender)],
          dto.national_id,
          dto.phoneNumber,
          await this.utilsService.hashString(dto.password),
          EAccountStatus.WAITING_EMAIL_VERIFICATION,
          await this.utilsService.generateRandomFourDigitNumber(),
        );
        roles = await this.roleService.getRolesByNames([
          ERole[ERole.COMPANY_EMPLOYEE],
        ]);
        org = await this.companyService.getCompanyById(dto.orgId);
        employee.company = org;
        employee.roles = roles;
        employee.address = address;
        return await this.employeeRepo.save(employee);
      case EAccountType[EAccountType.RESCUE_TEAM]:
        availableEmployee = await this.rescueTeamEmployeeRepo.findOne({
          where: { email: dto.email },
        });
        if (availableEmployee)
          throw new BadRequestException('The employee already exists');
        address = await this.addressService.createAddress(dto.address);
        let rescueTeamEmployee: RescueTeamEmployee = new RescueTeamEmployee(
          dto.firstName,
          dto.lastName,
          dto.email,
          dto.myGender,
          dto.national_id,
          await this.utilsService.hashString(dto.password),
          dto.phoneNumber,
          this.utilsService.generateRandomFourDigitNumber(),
        );
        roles = await this.roleService.getRolesByNames([
          ERole[ERole.RESCUE_TEAM_EMPLOYEE],
        ]);
        org = await this.companyService.getCompanyById(dto.orgId);
        rescueTeamEmployee.rescueTeam = org;
        rescueTeamEmployee.roles = roles;
        console.log(roles);
        rescueTeamEmployee.address = address;
        return await this.rescueTeamEmployeeRepo.save(rescueTeamEmployee);
      case EAccountType[EAccountType.RMB]:
        availableEmployee = await this.rmbEmployeeRepo.findOne({
          where: { email: dto.email },
        });
        if (availableEmployee)
          throw new BadRequestException('The employee already exists');
        address = await this.addressService.createAddress(dto.address);
        let rmbEmployee: RMBEmployee = new RMBEmployee(
          dto.firstName,
          dto.lastName,
          dto.email,
          EGender[dto.myGender],
          dto.national_id,
          dto.phoneNumber,
          await this.utilsService.hashString(dto.password),
          this.utilsService.generateRandomFourDigitNumber(),
        );
        roles = await this.roleService.getRolesByNames([
          ERole[ERole.RMB_EMPLOYEE],
        ]);
        rmbEmployee.address = address;
        rmbEmployee.roles = roles;
        return await this.rmbEmployeeRepo.save(rmbEmployee);
      default:
        throw new BadRequestException(
          'The provided organization type is invalid',
        );
    }
  }

  addCompanies(user: MiningCompanyEmployee, company: MiningCompany) {
    if (!user || !company)
      throw new BadRequestException('The company or user should not be');
    let companies: MiningCompany[] = [];
    companies.push(company);
    return user;
  }
  async approveAndRejectEmp(id: any, action: string) {
    let employee = await this.employeeRepo.findOneBy({
      id,
    });

    if (employee.status != EAccountStatus[EAccountStatus.ACTIVE]) {
      throw new BadRequestException('The Account has not yet been verified!');
    }
    switch (action.toUpperCase()) {
      case EActionType[EActionType.APPROVE]:
        employee.employeeStatus = EEmployeeStatus[EEmployeeStatus.APPROVED];
        break;
      case EActionType[EActionType.REJECT]:
        employee.employeeStatus = EEmployeeStatus[EEmployeeStatus.REJECTED];
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
    delete createdEmployee.password;
    delete createdEmployee.activationCode;
    return createdEmployee;
  }

  async createExcelEmp(employee: MainUser) {
    const availableEmployee = await this.employeeRepo.findOne({
      where: { email: employee.email },
    });
    if (!availableEmployee) {
      employee.password = await this.utilsService.hashString(employee.password);
      await this.employeeRepo.save(employee);
    }
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

  async getEmployeeById(id: any) {
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

  async getEmployeesByLoggedInCompany(
    req: Request,
    pageOptionsDto: PageOptionsDTO,
  ) {
    let employee: any = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    const employees = await this.employeeRepo.find({
      where: {
        company: employee.company,
        status: EAccountStatus[EAccountStatus.ACTIVE],
      },
      order: { createdAt: Order[pageOptionsDto.order] },
      take: pageOptionsDto.take,
    });

    // const queryBuilder = this.employeeRepo.createQueryBuilder("user");
    // console.log(Order[pageOptionsDto.order])
    //  queryBuilder.orderBy("user.createdAt", Order[pageOptionsDto.order]).take(pageOptionsDto.take);

    //  const itemCount=  await queryBuilder.getCount();
    //  const {entities} = await queryBuilder.getRawAndEntities();
    //  const pageMetaDto = new PageMetaDto({itemCount, pageOptionsDto})
    //  return new PageDto(entities, pageMetaDto);

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
    let employees = this.employeeRepo.find({
      where: { status: EAccountStatus[EAccountStatus.ACTIVE] },
    });
    let newEmployees: MiningCompanyEmployee[] = [];
    (await employees).forEach((employee) => {
      delete employee.password;
      delete employee.activationCode;
      delete employee.status;
      newEmployees.push(employee);
    });
    return newEmployees;
  }

  async deleteAllEmployees(req: Request) {
    let employee: any = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    let employees = await this.employeeRepo.find({
      where: { company: employee.company },
    });
    employees.forEach(async (employee) => {
      employee.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
      await this.employeeRepo.save(employee);
    });
  }

  async deleteEmployeeById(id: UUID, req: Request) {
    let availableEmployee: any = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    let employee = await this.getEmployeeById(id);
    if (employee.company == availableEmployee.company) {
      employee.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
      this.employeeRepo.remove(employee);
    }
  }

  // This api is optimized to be used to all types of employees
  async getMiningCompanyEmployeesByEmployeeStatus(
    status: string,
    req: Request,
  ) {
    let employee: any = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    switch (status.toUpperCase()) {
      case EEmployeeStatus[EEmployeeStatus.APPROVED]:
        return await this.employeeRepo.find({
          where: {
            company: employee.company,
            employeeStatus: EEmployeeStatus[EEmployeeStatus.APPROVED],
          },
        });
      case EEmployeeStatus[EEmployeeStatus.REJECTED]:
        return await this.employeeRepo.find({
          where: {
            company: employee.company,
            employeeStatus: EEmployeeStatus[EEmployeeStatus.REJECTED],
          },
        });
      case EEmployeeStatus[EEmployeeStatus.PENDING]:
        return await this.employeeRepo.find({
          where: {
            company: employee.company,
            employeeStatus: EEmployeeStatus[EEmployeeStatus.PENDING],
          },
        });

      default:
        throw new BadRequestException('The provided action is invalid');
    }
  }

  // This api is optimized to be used to all types of employees
  async getMiningCompanyEmployeesByStatus(status: string, req: Request) {
    let employee: any = await this.utilsService.getLoggedInProfile(
      req,
      'company',
    );
    switch (status.toUpperCase()) {
      case EAccountStatus[EAccountStatus.ACTIVE]:
        return await this.employeeRepo.find({
          where: {
            company: employee.company,
            status: EAccountStatus[EAccountStatus.ACTIVE],
            visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
          },
        });
      case EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION]:
        return await this.employeeRepo.find({
          where: {
            company: employee.company,
            status: EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION],
            visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
          },
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
        if ((user.status = EEmployeeStatus[EEmployeeStatus.APPROVED]))
          throw new ForbiddenException('The employee is already approved');
        user.status = EEmployeeStatus[EEmployeeStatus.APPROVED];
        break;
      case 'REJECT':
        user = await this.getEmployeeById(id);
        if ((user.status = EEmployeeStatus[EEmployeeStatus.REJECTED]))
          throw new ForbiddenException('The employee is already rejected');
        user.status = EEmployeeStatus[EEmployeeStatus.REJECTED];
        break;
      default:
        throw new BadRequestException('The provided action is invalid');
    }
  }
}
