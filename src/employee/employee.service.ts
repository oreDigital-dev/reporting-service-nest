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
import { Employee } from 'src/entities/employee.enity';
import { UUID } from 'crypto';
import { UpdateEmployeeDTO } from '../dtos/update-employee.dto';
import { log } from 'console';
import { MailingService } from 'src/mailing/mailing.service';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee) public employeeRepo: Repository<Employee>,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    private mailingService: MailingService,
  ) {}

  async createEmployee(dto: CreateEmployeeDTO, req: Request, res: Response) {
    try {
      const availableEmployee = await this.employeeRepo.findOne({
        where: { email: dto.email },
      });

      // if (availableEmployee) {
      //   throw new BadRequestException(
      //     'The employee with the provided email is already registered',
      //   );
      // }

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

      let emplyee: Employee = new Employee(
        dto.firstName,
        dto.lastName,
        dto.email,
        dto.username,
        gender,
        dto.national_id,
        dto.phonenumber,
        dto.salary,
        `OreDigital@${new Date().getFullYear()}`,
      );

      // this.mailingService.sendEmailToUser(
      //   emplyee.email,
      //   'employee-account-verification',
      //   'OreDigital account verification',
      // );

      emplyee.password = await this.utilsService.hashString(emplyee.password);

      let createdEmployee = await this.employeeRepo.save(emplyee);

      delete createdEmployee.password;
      delete createdEmployee.activationCode;

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
    const emplyee: Employee = new Employee(
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.username,
      gender,
      dto.national_id,
      dto.phonenumber,
      dto.salary,
      dto.password,
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
      relations: ['roles', 'companies'],
    });

    if (!isEmployeeAvailable)
      throw new NotFoundException(
        'The employe with the provided id is not found',
      );
    return isEmployeeAvailable;
  }

  async getEmployeeById(id: UUID) {
    const isEmployeeAvailable = await this.employeeRepo.findOne({
      where: { id: id },
      relations: ['roles', 'companies'],
    });
    if (!isEmployeeAvailable)
      throw new NotFoundException(
        'The employee with the provided id is not found',
      );
    return isEmployeeAvailable;
  }

  async getEmployeesByLoggedInCompany(req: Request, res: Response) {
    let company = await this.utilsService.getLoggedInProfile(
      req,
      res,
      'company',
    );
    return company.employees;
  }

  async getAllEmployees() {
    let employees = this.employeeRepo.find({});
    let newEmployees: Employee[] = [];
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
