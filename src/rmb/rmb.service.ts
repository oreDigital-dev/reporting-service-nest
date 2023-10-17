import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CreateOrganizationEmployeeDTO } from 'src/dtos/createRMBEmploye.dto';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { EActionType } from 'src/enums/EActionType.enum';
import { EEmployeeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { EGender } from 'src/enums/EGender.enum';
import { ERole } from 'src/enums/ERole.enum';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';
import { MailingService } from 'src/mailing/mailing.service';
import { RoleService } from 'src/roles/roles.service';
import { frontendAccountVerificationUrl } from 'src/utils/appData/constants';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class RmbService {
  constructor(
    @InjectRepository(RMBEmployee) public rmbRepo: Repository<RMBEmployee>,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    private roleService: RoleService,
    private mailService: MailingService,
  ) {}

  async createSytemAdmin(dto: CreateOrganizationEmployeeDTO) {
    if (
      dto.registrationKey != 'admin@oreDigital' &&
      dto.employeeType == EEmployeeType[EEmployeeType.ADMIN]
    )
      throw new BadRequestException(
        'You have provided invalid registration key',
      );
    const isUserAvailable = await this.rmbRepo.find({
      where: [
        {
          email: dto.email,
          phonenumber: dto.phoneNumber,
        },
      ],
    });
    if (isUserAvailable.length != 0) {
      throw new ForbiddenException(
        'The user with that email or phoneNumber already exist',
      );
    }
    let systemAdmin = new RMBEmployee(
      dto.firstName,
      dto.lastName,
      dto.email,
      EGender[dto.myGender],
      dto.national_id,
      dto.phoneNumber,
      dto.password,
      this.utilsService.generateRandomFourDigitNumber(),
    );
    const rmbEmployee = await this.roleService.getRoleByName(
      ERole[ERole.RMB_EMPLOYEE],
    );

    const roles: any = await this.roleService.getRolesByNames([
      ERole[ERole.SYSTEM_ADMIN],
      ERole[ERole.RMB_ADMIN],
    ]);
    systemAdmin.password = await this.utilsService.hashString(
      systemAdmin.password,
    );

    switch (dto.employeeRole.toUpperCase()) {
      case 'ADMIN':
        systemAdmin.roles = roles;
        break;
      case 'EMPLOYEE':
        systemAdmin.roles = [rmbEmployee];
        break;
      default:
        throw new BadRequestException('The provided userType is invalid');
    }
    let createdAdmin = await this.rmbRepo.save(systemAdmin);
    await this.mailService.sendEmail(
      createdAdmin.email,
      createdAdmin.lastName,
      createdAdmin.activationCode,
      frontendAccountVerificationUrl,
      false,
    );
    // await this.mailService.sendPhoneSMSTOUser(
    //   systemAdmin.phonenumber,
    //   `Hello! Your account as a system admin has been created successfully! your account verification code is ${systemAdmin.activationCode}`,
    // );

    delete createdAdmin.password;
    return {
      message:
        'we have a verification email to this admin to verify  the account',
      admin: createdAdmin,
    };
  }

  async getRMBEmployeeById(id: UUID) {
    const availableEmployee = await this.rmbRepo.findOne({
      where: { id: id },
      relations: ['roles', 'notifications'],
    });
    if (!availableEmployee)
      throw new NotFoundException(
        'The rmb employee with the provided id is not found',
      );
    return availableEmployee;
  }

  async getRMBEmployeeByEmail(email: string) {
    const availableEmployee = await this.rmbRepo.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!availableEmployee)
      throw new NotFoundException(
        'The rmb employee with the provided email is not found',
      );
    return availableEmployee;
  }
  async getAllRMBEmployees() {
    return await this.rmbRepo.find({
      where: { visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE] },
    });
  }

  async deleteRMBEmployee(id: UUID) {
    const employee = await this.getRMBEmployeeById(id);
    employee.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
    await this.rmbRepo.save(employee);
  }

  async deleteAllRMBEmployees() {
    const employees = await this.rmbRepo.find({});
    employees.forEach(async (emp) => {
      emp.visibility = EVisibilityStatus[EVisibilityStatus.HIDDEN];
      await this.rmbRepo.save(emp);
    });
  }

  async approveOrRejectRMBEmployee(action: string, id: UUID) {
    let availableEmployee = await this.rmbRepo.findOne({ where: { id: id } });
    if (!availableEmployee)
      throw new NotFoundException(
        'The RMB employee witht he provided id is not found',
      );
    switch (action.toUpperCase()) {
      case EActionType[EActionType.REJECT]:
        availableEmployee.employeeStatus =
          EEmployeeStatus[EEmployeeStatus.REJECTED];
        // await this.mailService.sendPhoneSMSTOUser(
        //   availableEmployee.phonenumber,
        //   'Hello! as oreDigital, we are kindly regretting that your request to create account as RMB employee has been  rejected due to many different reasons!!! Happy risk reducing and improve productivity',
        // );
        break;
      case EActionType[EActionType.APPROVE]:
        availableEmployee.employeeStatus =
          EEmployeeStatus[EEmployeeStatus.APPROVED];
        // await this.mailService.sendPhoneSMSTOUser(
        //   availableEmployee.phonenumber,
        //   'Hello! as oreDigital, we are proudly happy to let you know that  that your request to create account as RMB employee has been  approved! Reduce the risk and improve productivity',
        // );
        break;
      default:
        throw new BadRequestException(
          'The rmb employee with the provided id is not found',
        );
    }
    return await this.rmbRepo.save(availableEmployee);
  }

  async getAllRMBEmployeesByStatus(status: string) {
    switch (status.toUpperCase()) {
      case EEmployeeStatus[EEmployeeStatus.REJECTED]:
        return await this.rmbRepo.find({
          where: {
            employeeStatus: EEmployeeStatus[EEmployeeStatus.REJECTED],
            visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
          },
        });
      case EEmployeeStatus[EEmployeeStatus.APPROVED]:
        return await this.rmbRepo.find({
          where: {
            employeeStatus: EEmployeeStatus[EEmployeeStatus.APPROVED],
            visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
          },
        });
      case EEmployeeStatus[EEmployeeStatus.PENDING]:
        return await this.rmbRepo.find({
          where: {
            employeeStatus: EEmployeeStatus[EEmployeeStatus.PENDING],
            visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
          },
        });
      default:
        throw new BadRequestException('The provided status is not supported');
    }
  }
}
