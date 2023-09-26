import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
  ForbiddenException,
} from '@nestjs/common';

import { LoginDTO } from 'src/dtos/login.dto';
import { ERole } from 'src/enums/ERole.enum';
import { EUserStatus } from 'src/enums/EUserStatus.enum';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { RmbService } from 'src/rmb/rmb.service';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { MainUser } from 'src/entities/MainUser.entity';
import { MailingService } from 'src/mailing/mailing.service';
import { User } from 'src/entities/us.entity';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    private employeeService: EmployeeService,
    @Inject(forwardRef(() => RmbService))
    private rmbService: RmbService,
    private rescueTeamService: RescueTeamsService,
    private mailingService: MailingService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  async login(dto: LoginDTO) {
    let user: any;
    let type: string;
    switch (dto.userType.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        user = await this.employeeService.employeeRepo.findOne({
          where: { email: dto.email },
          relations: ['roles', 'company'],
        });
        type = 'company';
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        user = await this.rescueTeamService.rescueTeamEmployeeRepo.findOne({
          where: { email: dto.email },
          relations: ['roles'],
        });
        type = 'rescue_team';
        break;
      case EAccountType[EAccountType.RMB]:
        user = await this.rmbService.rmbRepo.findOne({
          where: { email: dto.email },
          relations: ['roles'],
        });
        type = 'rmb';
        break;
      default:
        throw new BadRequestException('The provided account type is invalid');
    }

    if (!user) throw new BadRequestException('Invalid email or password');
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch)
      throw new BadRequestException('Invalid email or password');

    if (user.status == EUserStatus[EUserStatus.WAITING_EMAIL_VERIFICATION])
      throw new BadRequestException(
        'This account is not yet verified, please check your gmail for verification details',
      );
    const tokens = this.utilsService.getTokens(user, type);
    delete user.password;
    return {
      access_token: (await tokens).accessToken,
      refresh_token: (await tokens).refreshToken,
      user: user,
    };
  }

  async verifyAccount(email: string, userType: String) {
    let user;
    let activatedUser;
    let tokens;
    let verifiedAccount;

    switch (userType.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        user = await this.employeeService.employeeRepo.findOne({
          where: { email: email },
          relations: ['roles', 'company'],
        });
        activatedUser = this.activateUser(user);
        verifiedAccount = await this.userService.userRepo.save(user);
        tokens = await this.utilsService.getTokens(activatedUser, 'company');
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        user = await this.rescueTeamService.rescueTeamEmployeeRepo.findOne({
          where: { email: email },
          relations: ['roles'],
        });
        activatedUser = this.activateUser(user);
        verifiedAccount = await this.userService.userRepo.save(user);
        tokens = await this.utilsService.getTokens(
          activatedUser,
          'rescue_team',
        );
        break;
      case EAccountType[EAccountType.RMB]:
        user = await this.rmbService.rmbRepo.findOne({
          where: { email: email },
          relations: ['roles'],
        });
        activatedUser = this.activateUser(user);
        verifiedAccount = await this.userService.userRepo.save(user);
        tokens = await this.utilsService.getTokens(activatedUser, 'rmb');
        break;
      default:
        throw new BadRequestException('The provided account type is invalid');
    }
    delete user.password;
    return { tokens, user: verifiedAccount };
  }

  activateUser(user: MainUser) {
    if (user.status === EAccountStatus[EAccountStatus.ACTIVE])
      throw new BadRequestException('This is already verified');
    user.status = EAccountStatus[EAccountStatus.PENDING];
    user.roles.forEach((role) => {
      if (role.roleName == ERole[ERole.SYSTEM_ADMIN]) {
        user.status = EUserStatus[EUserStatus.ACTIVE];
      }
    });
    return user;
  }

  getUserByEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  async resetPassword(
    email: string,
    activationCode: number,
    newPassword: string,
  ) {
    const account = await this.userService.getUserByEmail(email);
    if (!account) throw new BadRequestException('This account does not exist');
    if (
      account.status === EAccountStatus[EAccountStatus.PENDING] ||
      account.status ==
        EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION]
    )
      throw new BadRequestException(
        "Please first verify your account and we'll help you to remember your password later",
      );
    if (account.activationCode != activationCode)
      throw new BadRequestException(
        'Your provided invalid activation code, you can request another.',
      );
    account.password = await this.utilsService.hashString(
      newPassword.toString(),
    );
    const savedUser = await this.userService.userRepo.save(account);
    const tokens = await this.utilsService.getTokens(account, 'company');
    delete savedUser.password;
    delete savedUser.activationCode;
    return { tokens, user: savedUser };
  }

  async getProfile(req: Request, type: string) {
    let profile = this.utilsService.getLoggedInProfile(req, type);
    return profile;
  }

  async resendVerificationCode(email: string, userType: string) {
    let user: MainUser;
    switch (userType.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        user = await this.employeeService.employeeRepo.findOne({
          where: { email: email },
        });
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        user = await this.rescueTeamService.rescueTeamEmployeeRepo.findOne({
          where: { email: email },
        });

        break;
      case EAccountType[EAccountType.RMB]:
        user = await this.rmbService.rmbRepo.findOne({
          where: { email: email },
        });
        break;
      default:
        throw new BadRequestException('The provided account type is invalid');
    }

    if (user.status == EAccountStatus[EAccountStatus.ACTIVE])
      throw new ForbiddenException(
        'Your account is already active, please login',
      );
    await this.mailingService.sendEmail(
      user.email,
      user.lastName,
      user.activationCode,
      '',
      false,
    );
    await this.mailingService.sendPhoneSMSTOUser(
      user.phonenumber,
      `Hello ${user.lastName} this is OreDigital , thank for creating an account , please your verification code is ${user.activationCode}`,
    );
  }
}
