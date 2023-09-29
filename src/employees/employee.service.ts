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
import { Request, Response } from 'express';
import { EGender } from 'src/enums/EGender.enum';
import { UUID } from 'crypto';
import { UpdateEmployeeDTO } from '../dtos/update-employee.dto';
import { MailingService } from 'src/mailing/mailing.service';
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
import { EOrganizationType } from 'src/enums/EOrganizationType';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(MiningCompanyEmployee)
    public employeeRepo: Repository<MiningCompanyEmployee>,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,

    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,

    private mailingService: MailingService,
    private roleService: RoleService,
    private addressService: AddressService,
  ) {}

  async createEmployee(dto: CreateEmployeeDTO) {
    try {
      const availableEmployee = await this.employeeRepo.findOne({
        where: { email: dto.email },
      });
      console.log(availableEmployee);

      if (availableEmployee) {
        throw new BadRequestException(
          'The employee with the provided email is already registered',
        );
      }
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

      let emp: MiningCompanyEmployee = new MiningCompanyEmployee(
        dto.firstName,
        dto.lastName,
        dto.email,
        gender,
        dto.national_id,
        dto.phoneNumber,
        hashedPassword,
        Number(otp),
      );

      let company = await this.companyService.getCompanyById(dto.company);
      emp.company = company;

      let address: Address = await this.addressService.createAddress(
        dto.address,
      );

      emp.address = address;
      const employee = await this.roleService.assignRoleToEmployee(
        ERole[ERole.COMPANY_OWNER],
        emp,
      );

      await this.employeeRepo.save(employee);

      // this.mailingService.sendEmailToUser(
      //   emp.email,
      //   'employee-account-verification',
      //   'OreDigital account verification',
      // );
      const tokens = await this.utilsService.getTokens(emp, 'company');

      return await this.employeeRepo.findOne({
        where: { email: emp.email },
        relations: ['roles', 'company'],
      });
    } catch (error) {
      console.error('Error creating employee: ', error);
      throw error;
    }
  }

  async approveAndRejectEmp(id: UUID, action: string) {
    let employee = await this.employeeRepo.findOneBy({
      id,
    });

    if (employee.status == EActionType[EAccountStatus.ACTIVE]) {
      throw new BadRequestException('The Account has not yet been verified!');
    }

    if (action == EActionType[EActionType.APPROVE]) {
      employee.status = EActionType[EActionType.APPROVE];
    } else {
      employee.status = EActionType[EActionType.REJECT];
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
        'The employee with the provided id is not found',
      );
    return isEmployeeAvailable;
  }

  async getEmployeeById(id: UUID) {
    const isEmployeeAvailable = await this.employeeRepo.findOne({
      where: { id: id },
      relations: ['roles', 'company', 'notifications'],
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
    const employees = await this.employeeRepo.findOne({
      where: { company: employee.company },
    });
    return employees;
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