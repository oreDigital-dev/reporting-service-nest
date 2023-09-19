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
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { EGender } from 'src/enums/EGender.enum';
import { ERole } from 'src/enums/ERole.enum';
import { EUserType } from 'src/enums/EUserType.enum';
import { MailingService } from 'src/mailing/mailing.service';
import { RoleService } from 'src/roles/roles.service';
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

    switch (dto.employeeType.toUpperCase()) {
      case 'ADMIN':
        systemAdmin.roles = roles;
        break;
      case 'EMPLOYEE':
        systemAdmin.roles = [rmbEmployee];
        break;
      default:
        throw new BadRequestException('The provided userType is invalid');
    }
    systemAdmin.activationCode =
      this.utilsService.generateRandomFourDigitNumber();
    let createdAdmin = await this.rmbRepo.save(systemAdmin);
    // await this.mailService.sendPhoneSMSTOUser(
    //   systemAdmin.phonenumber,
    //   `Hello! Your account as a system admin has been created successfully! your account verification code is ${systemAdmin.activationCode}`,
    // );
    // this.mailService.sendEmailToUser(
    //   createdAdmin.email,
    //   'verify-account',
    //   'OreDigital account verification',
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
      relations: ['roles'],
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
    return await this.rmbRepo.find({});
  }

  async deleteRMBEmployee(id: UUID) {
    const employee = await this.getRMBEmployeeById(id);
    await this.rmbRepo.remove(employee);
  }

  async deleteAllRMBEmployees() {
    const employees = await this.rmbRepo.find({});
    employees.forEach(async (emp) => {
      await this.rmbRepo.remove(emp);
    });
  }

  async approveOrRejectRMBEmployee(action: string, id: UUID) {
    let availableEmployee = await this.rmbRepo.findOne({ where: { id: id } });
    if (!availableEmployee)
      throw new NotFoundException(
        'The RMB employee witht he provided id is not found',
      );
    switch (action.toUpperCase()) {
      case 'REJECT':
        availableEmployee.status = EAccountStatus[EAccountStatus.REJECTED];
        // await this.mailService.sendPhoneSMSTOUser(
        //   availableEmployee.phonenumber,
        //   'Hello! as oreDigital, we are kindly regretting that your request to create account as RMB employee has been  rejected due to many different reasons!!! Happy risk reducing and improve productivity',
        // );
        break;
      case 'APPROVE':
        availableEmployee.status = EAccountStatus[EAccountStatus.APPROVED];
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
      case EAccountStatus[EAccountStatus.REJECTED]:
        return await this.rmbRepo.find({
          where: { status: EAccountStatus[EAccountStatus.REJECTED] },
        });
      case EAccountStatus[EAccountStatus.APPROVED]:
        return await this.rmbRepo.find({
          where: { status: EAccountStatus[EAccountStatus.APPROVED] },
        });
      case EAccountStatus[EAccountStatus.PENDING]:
        return await this.rmbRepo.find({
          where: { status: EAccountStatus[EAccountStatus.PENDING] },
        });
      default:
        throw new BadRequestException('The provided status is not supported');
    }
  }
}
