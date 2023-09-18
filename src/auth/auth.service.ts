import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
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
        user = await this.employeeService.employeeRepo.findOne({
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

  async verifyAccount(email: string) {
    const verifiedAccount = await this.userService.getUserByEmail(email);
    if (verifiedAccount.status === EAccountStatus[EAccountStatus.ACTIVE])
      throw new BadRequestException('This is already verified');
    verifiedAccount.status = EAccountStatus[EAccountStatus.PENDING];
    verifiedAccount.roles.forEach((role) => {
      if (role.roleName == ERole[ERole.SYSTEM_ADMIN]) {
        verifiedAccount.status = EUserStatus[EUserStatus.ACTIVE];
      }
    });
    const verifiedAccount2 = await this.userService.userRepo.save(
      verifiedAccount,
    );
    const tokens = await this.utilsService.getTokens(
      verifiedAccount2,
      'company',
    );
    delete verifiedAccount2.password;
    return { tokens, user: verifiedAccount2 };
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

  async getProfile(req: Request, res: Response, type: string) {
    let profile = this.utilsService.getLoggedInProfile(req, res, type);
    return profile;
  }
}
