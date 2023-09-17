import {
  BadRequestException,
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
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';
import { generate } from 'otp-generator';
import { Address } from 'src/entities/address.entity';
import { AddressService } from 'src/address/address.service';

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
    private addressService : AddressService
  ) {}

  async createEmployee(dto: CreateEmployeeDTO) {
    try {
      const availableEmployee = await this.employeeRepo.findOne({
        where: { email: dto.email },
      });
      console.log(availableEmployee)

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

      let emplyee: MiningCompanyEmployee = new MiningCompanyEmployee(
        dto.firstName,
        dto.lastName,
        dto.email,
        gender,
        dto.national_id,
        dto.phoneNumber,
        hashedPassword,
        Number(otp),
        ECompanyRole[dto.employeeRole]
      );

      let company = await this.companyService.getCompanyById(dto.company);
      emplyee.company = company;

      let address: Address = await this.addressService.createAddress(
        dto.address,
      );

      emplyee.address = address
      
      let createdEmployee = await this.employeeRepo.save(emplyee);

      delete createdEmployee.password;
      delete createdEmployee.activationCode;

      this.mailingService.sendEmailToUser(
        emplyee.email,
        'employee-account-verification',
        'OreDigital account verification',
      );
      const tokens = await this.utilsService.getTokens(emplyee, 'company');
      let savedEmployee = await this.employeeRepo.findOne({
        where: { email: emplyee.email },
        relations: ['roles'],
      });

      const employee = await this.roleService.assignRoleToEmployee(
        ERole[ERole.COMPANY_OWNER],
        savedEmployee,
      );


      savedEmployee = await this.employeeRepo.save(employee);
      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        emplyee: await this.employeeRepo.findOne({
          where: { email: emplyee.email },
          relations: ['roles', 'company'],
        }),
      };
    } catch (error) {
      console.error('Error creating employee: ', error);
      throw error;
    }
  }

  

  async createEmp(employee: MiningCompanyEmployee) {
    try {
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
      delete createdEmployee.activationCode;
      this.mailingService.sendEmailToUser(
        employee.email,
        'employee-account-verification',
        'OreDigital account verification',
      );
      return createdEmployee;
    } catch (error) {
      console.error('Error creating employee: ', error);
      throw error;
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

    const emplyee: MiningCompanyEmployee = new MiningCompanyEmployee(
      dto.firstName,
      dto.lastName,
      dto.email,
      gender,
      dto.national_id,
      dto.phoneNumber,
      hashedPassword,
      Number(otp),
      ECompanyRole[dto.employeeRole]
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
      relations: ['roles'],
    });
    if (!isEmployeeAvailable)
      throw new NotFoundException(
        'The employee with the provided id is not found',
      );
    return isEmployeeAvailable;
  }

  async getEmployeesByLoggedInCompany(req: Request, res: Response) {
    let company: any = await this.utilsService.getLoggedInProfile(req, res);
    return company.employees;
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
}

