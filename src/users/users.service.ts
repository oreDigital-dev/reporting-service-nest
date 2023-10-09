/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { User } from 'src/entities/us.entity';
import { UUID } from 'crypto';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { RoleService } from 'src/roles/roles.service';
import { ERole } from 'src/enums/ERole.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { MailingService } from 'src/mailing/mailing.service';
import { UtilsService } from 'src/utils/utils.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeService } from 'src/employees/employee.service';
import { RmbService } from 'src/rmb/rmb.service';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { EOrganizationType } from 'src/enums/EOrganizationType';
import { EActionType } from 'src/enums/EActionType.enum';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { MainUser } from 'src/entities/MainUser.entity';
import { EEmployeeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) public userRepo: Repository<User>,

    private roleService: RoleService,
    private mailService: MailingService,
    private utilsService: UtilsService,
    private employeeService: EmployeeService,
    private rmbService: RmbService,
    private rescueTeamService: RescueTeamsService,
  ) {}

  async createSytemAdmin(dto: CreateUserDto) {
    if (dto.registrationKey != 'admin@oreDigital')
      throw new BadRequestException(
        'You have provided invalid registration key',
      );
    const isUserAvailable = await this.userRepo.find({
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
    let systemAdmin = new User(
      dto.firstName,
      dto.lastName,
      dto.email,
      EGender[dto.myGender],
      dto.national_id,
      dto.phoneNumber,
      dto.password,
      EAccountStatus.WAITING_EMAIL_VERIFICATION,
    );
    const adminRole = await this.roleService.getRoleByName(
      ERole[ERole.SYSTEM_ADMIN],
    );
    systemAdmin.password = await this.utilsService.hashString(
      systemAdmin.password,
    );
    systemAdmin.roles = [adminRole];
    systemAdmin.activationCode = this.generateRandomFourDigitNumber();
    let createdAdmin = await this.userRepo.save(systemAdmin);
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

  async getUsers() {
    const response = await this.userRepo.find({ relations: ['roles'] });
    return response;
  }

  async getUserByEmail(email: any) {
    let user: any;
    user = await this.employeeService.getEmployeeByEmail(email);
    if (!user) {
      user = await this.rmbService.getRMBEmployeeByEmail(email);
    }

    if (!user)
      throw new NotFoundException(
        'The user with the provided email is not found',
      );
    return user;
  }

  async getUserById(id: UUID, entity: String) {
    const response = await this.userRepo.findOne({
      where: {
        id: id,
      },
      relations: ['roles', 'company'],
    });
    if (!response) {
      throw new NotFoundException(`${entity} not found`);
    }
    return response;
  }

  generateRandomFourDigitNumber(): number {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // This api is optimized to be used to all types of employees
  async approveOrRejectUsers(id: UUID, action: string, organization) {
    let user: MainUser;
    switch (organization.toUpperCase()) {
      case EOrganizationType[EOrganizationType.COMPANY]:
        switch (action.toUpperCase()) {
          case 'APPROVE':
            user = await this.employeeService.getEmployeeById(id);
            if ((user.status = EAccountStatus[EEmployeeStatus.APPROVED]))
              throw new ForbiddenException('The employee is already approved');
            user.status = EEmployeeStatus[EEmployeeStatus.APPROVED];
            break;
          case 'REJECT':
            user = await this.employeeService.getEmployeeById(id);
            if ((user.status = EEmployeeStatus[EEmployeeStatus.REJECTED]))
              throw new ForbiddenException('The employee is already rejected');
            user.status = EEmployeeStatus[EEmployeeStatus.REJECTED];
            break;
          default:
            throw new BadRequestException('The provided action is invalid');
        }
        break;
      case EOrganizationType[EOrganizationType.RESCUE_TEAM]:
        switch (action.toUpperCase()) {
          case 'APPROVE':
            user = await this.rescueTeamService.getEmployeeById(id);
            if ((user.status = EEmployeeStatus[EEmployeeStatus.APPROVED]))
              throw new ForbiddenException('The employee is already approved');
            user.status = EEmployeeStatus[EEmployeeStatus.APPROVED];
            break;
          case 'REJECT':
            user = await this.rescueTeamService.getEmployeeById(id);
            if ((user.status = EEmployeeStatus[EEmployeeStatus.REJECTED]))
              throw new ForbiddenException('The employee is already rejected');
            user.status = EEmployeeStatus[EEmployeeStatus.REJECTED];
            break;
          default:
            throw new BadRequestException('The provided action is invalid');
        }
        break;
      case EOrganizationType[EOrganizationType.RMB]:
        switch (action.toUpperCase()) {
          case 'APPROVE':
            user = await this.rmbService.getRMBEmployeeById(id);
            if ((user.status = EEmployeeStatus[EEmployeeStatus.APPROVED]))
              throw new ForbiddenException('The employee is already approved');
            user.status = EEmployeeStatus[EEmployeeStatus.APPROVED];
            break;
          case 'REJECT':
            user = await this.rmbService.getRMBEmployeeById(id);
            if ((user.status = EEmployeeStatus[EEmployeeStatus.REJECTED]))
              throw new ForbiddenException('The employee is already rejected');
            user.status = EEmployeeStatus[EEmployeeStatus.REJECTED];
            break;
          default:
            throw new BadRequestException('The provided action is invalid');
        }
        break;
      default:
        throw new BadRequestException(
          'The provided organization type is invalid',
        );
    }
  }

  // This api is optimized to be used to all types of employees
  async getUsersByStatus(status: string, organization: string) {
    switch (organization.toUpperCase()) {
      case EOrganizationType[EOrganizationType.RMB]:
        switch (status.toUpperCase()) {
          case EActionType[EActionType.APPROVE] + 'D':
            return await this.rmbService.rmbRepo.find({
              where: {
                status: EEmployeeStatus[EEmployeeStatus.APPROVED],
                visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
              },
            });
          case EActionType[EActionType.REJECT] + 'D':
            return await this.rmbService.rmbRepo.find({
              where: {
                status: EEmployeeStatus[EEmployeeStatus.REJECTED],
                visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
              },
            });
          default:
            throw new BadRequestException('The provided action is invalid');
        }
        break;
      case EOrganizationType[EOrganizationType.COMPANY]:
        switch (status.toUpperCase()) {
          case EActionType[EActionType.APPROVE] + 'D':
            return await this.employeeService.employeeRepo.find({
              where: {
                status: EEmployeeStatus[EEmployeeStatus.APPROVED],
                visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
              },
            });
          case EActionType[EActionType.REJECT] + 'D':
            return await this.employeeService.employeeRepo.find({
              where: {
                status: EEmployeeStatus[EEmployeeStatus.REJECTED],
                visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
              },
            });
          default:
            throw new BadRequestException('The provided action is invalid');
        }
        break;
      case EOrganizationType[EOrganizationType.RESCUE_TEAM]:
        switch (status.toUpperCase()) {
          case EActionType[EActionType.APPROVE] + 'D':
            return await this.rescueTeamService.rescueTeamEmployeeRepo.find({
              where: {
                status: EEmployeeStatus[EEmployeeStatus.APPROVED],
                visibility: EVisibilityStatus[EVisibilityStatus.VISIBLE],
              },
            });
          case EActionType[EActionType.REJECT] + 'D':
            return await this.rescueTeamService.rescueTeamEmployeeRepo.find({
              where: { status: EEmployeeStatus[EEmployeeStatus.REJECTED] },
            });
          default:
            throw new BadRequestException('The provided action is invalid');
            break;
        }
        break;
      default:
        throw new BadRequestException(
          'The provided organization type is invalid',
        );
    }
  }
}
