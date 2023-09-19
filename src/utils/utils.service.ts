import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Exception } from 'handlebars/runtime';
import { AuthService } from 'src/auth/auth.service';
import { CompanyService } from 'src/company/company.service';
import { User } from 'src/entities/us.entity';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UtilsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private miningCompanyService: EmployeeService,

    @Inject(forwardRef(() => RmbService))
    private rmbEmployeeService: RmbService,
  ) { }

  async getTokens(
    user: User,
    entity: string,
  ): Promise<{ accessToken: String; refreshToken: String }> {
    let type: string;

    switch (entity.toUpperCase()) {
      case 'RMB':
        type = EAccountType[EAccountType.RMB];
        break;
      case 'COMPANY':
        type = EAccountType[EAccountType.COMPANY];
        break;
      case 'RESCUE_TEAM':
        type = EAccountType[EAccountType.RESCUE_TEAM];
        break;
      default:
        throw new BadRequestException(
          'The provided entity type is not defined',
        );
    }
    const accessToken: String = await this.jwtService.signAsync(
      {
        type: type,
        roles: user.roles,
        id: user.id,
        national_id: user.national_id,
      },
      {
        expiresIn: '10h',
        secret: this.configService.get('SECRET_KEY'),
      },
    );
    const refreshToken: String = await this.jwtService.signAsync(
      {
        type: type,
        roles: user.roles,
        id: user.id,
        national_id: user.national_id,
      },
      {
        expiresIn: '1d',
        secret: this.configService.get('SECRET_KEY'),
      },
    );

    return {
      accessToken: accessToken.toString(),
      refreshToken: refreshToken.toString(),
    };
  }

  async hashString(input: string) {
    try {
      const hashed = await bcrypt.hash(input, 10);
      return hashed;
    } catch (error) {
      console.error('Error occurred while hashing:', error.message);
      throw error;
    }
  }

  generateRandomFourDigitNumber(): number {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  idValidator(id: String): boolean {
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id.toString());
  }

  async getLoggedInProfile(req: Request, type: string) {
    const authorization = req.headers.authorization;

    let user: any;

    if (authorization) {
      const token = authorization.split(' ')[1];
      if (!authorization.toString().startsWith('Bearer '))
        throw new UnauthorizedException('The provided token is invalid');
      const { tokenVerified, error } = this.jwtService.verify(token, {
        secret: this.configService.get('SECRET_KEY'),
      });
      if (error)
        throw new BadRequestException({ sucess: false, message: error.message });
      const details: any = await this.jwtService.decode(token);
      switch (type.toUpperCase()) {
        case EAccountType[EAccountType.COMPANY]:
          user = await this.miningCompanyService.getEmployeeById(details.id);
          break;
        case EAccountType[EAccountType.RMB]:
          user = await this.rmbEmployeeService.getRMBEmployeeById(details.id);
          break;
        case EAccountType[EAccountType.RESCUE_TEAM]:
          await this.userService.getUserById(details.id, 'User');
          break;
        default:
          throw new BadRequestException(
            'The provided user type to decode is invalid',
          );
      }

      return user;
    } else {
      throw new Exception(
        'Please you are not authorized to access resource',
      );
    }
  }
}
