import {
  BadRequestException,
  Injectable,
  forwardRef,
  Inject,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { Request, Response } from 'express';
import { LoginDTO } from 'src/dtos/login.dto';
import { ERole } from 'src/enums/ERole.enum';
import { EUserStatus } from 'src/enums/EUserStatus.enum';
import { EUserType } from 'src/enums/EUserType.enum';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { UsersService } from 'src/users/users.service';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    @Inject(forwardRef(() => UtilsService))
    private utilsService: UtilsService,
    private employeeService: EmployeeService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  async login(dto: LoginDTO) {
    let user: any;
    console.log(dto);
    if (dto.userType.toUpperCase() == EUserType[EUserType.MINING_EMPLOYEE]) {
      user = await this.employeeService.employeeRepo.findOne({
        where: { email: dto.email },
      });
    }
    const passwordMatch = await compare(dto.password, user.password);
    if (!passwordMatch)
      throw new BadRequestException('Invalid email or password');

    if (user.status == EUserStatus[EUserStatus.WAITING_EMAIL_VERIFICATION])
      throw new BadRequestException(
        'This account is not yet verified, please check your gmail for verification details',
      );
    if(user.status == EUserStatus[EUserStatus.PENDING]){
      throw new ForbiddenException("Your account has not yet been proven, please wait for approval!")
    }
    const tokens = this.utilsService.getTokens(user, dto.userType);
    delete user.password;
    return {
      access_token: (await tokens).accessToken,
      refresh_token: (await tokens).refreshToken,
      user: user,
    };
  }

  async verifyAccount(email: string) {
    let verifiedAccount = null;
    verifiedAccount =  await this.userService.getUserByEmail(email);
    if (verifiedAccount.status === EUserStatus[EUserStatus.ACTIVE] || verifiedAccount.status === EUserStatus[EUserStatus.PENDING])
      throw new BadRequestException('This email is already verified');
    verifiedAccount.status = EUserStatus[EUserStatus.PENDING];
    verifiedAccount.roles.forEach((role) => {
      if (role.roleName == ERole[ERole.SYSTEM_ADMIN]) {
        verifiedAccount.status = EUserStatus[EUserStatus.ACTIVE];
      }
    });
    let  verifiedAccount2 = await this.userService.userRepo.save(
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
      account.status === EUserStatus[EUserStatus.PENDING] ||
      account.status ==
        EUserStatus[EUserStatus.WAITING_EMAIL_VERIFICATION]
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

  async getProfile(req: Request, res: Response) {
    let profile = this.utilsService.getLoggedInProfile(req, res);
    return profile;
  }
}
