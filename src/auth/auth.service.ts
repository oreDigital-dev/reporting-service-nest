import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { LoginDTO } from 'src/dtos/login.dto';
import { EmployeeService } from 'src/employee/employee.service';
import { User } from 'src/entities/us.entity';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { ERole } from 'src/enums/ERole.enum';
import { EUserType } from 'src/enums/EUserType.enum';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    private employeeService: EmployeeService
  ) { }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async login(dto: LoginDTO) {
    let user: any;
    if (EUserType[dto.userType] == EUserType.RMB_EMPLOYEE) {
       user = await this.employeeService.getEmployeeByEmail(dto.email);
    }
    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password,
    )
    console.log("PWD",passwordMatch)
    if (!passwordMatch)
      throw new BadRequestException('Invalid email or password');
    if (
      user.status ==
      EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION] ||
      user.status == EAccountStatus[EAccountStatus.PENDING]
    )
      throw new BadRequestException(
        'This account is not yet verified, please check your gmail inbox for verification details',
      );
    const tokens = this.utilsService.getTokens(user);
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
        verifiedAccount.status = EAccountStatus[EAccountStatus.ACTIVE];
      }
    });
    const verifiedAccount2 = await this.userService.userRepo.save(
      verifiedAccount,
    );
    const tokens = await this.utilsService.getTokens(verifiedAccount2);
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
    const tokens = await this.utilsService.getTokens(account);
    delete savedUser.password;
    delete savedUser.activationCode;
    return { tokens, user: savedUser };
  }

  async getProfile(req: Request, res: Response) {
    let profile = this.utilsService.getLoggedInProfile(req, res);
    return profile;
  }
}
