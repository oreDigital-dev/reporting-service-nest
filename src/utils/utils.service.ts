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
import { Request } from 'express';
import { Exception } from 'handlebars/runtime';
import { AuthService } from 'src/auth/auth.service';
import { CompanyService } from 'src/company/company.service';
import { MainUser } from 'src/entities/MainUser.entity';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { EGender } from 'src/enums/EGender.enum';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UtilsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    @Inject(forwardRef(() => AuthService))
    @Inject(forwardRef(() => CompanyService))
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    private miningCompanyService: EmployeeService,
    @Inject(forwardRef(() => RmbService))
    private rmbEmployeeService: RmbService,
    @Inject(RescueTeamsService)
    private readonly rescueTeamService: RescueTeamsService,
  ) {}

  async getTokens(
    user: MainUser,
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

  getGender = (gender: string) => {
    switch (gender.toUpperCase()) {
      case EGender[EGender.FEMALE]:
        return EGender[EGender.FEMALE];
      case EGender[EGender.MALE]:
        return EGender[EGender.MALE];
      case EGender[EGender.OTHER]:
        return EGender[EGender.OTHER];
      default:
        throw new BadRequestException('The provided gender is invalid');
    }
  };

  getEmployeeType = (type: string) => {
    switch (type.toUpperCase()) {
      case EEmployeeType[EEmployeeType.ADMIN]:
        return EEmployeeType[EEmployeeType.ADMIN];
      case EEmployeeType[EEmployeeType.EMPLOYEE]:
        return EEmployeeType[EEmployeeType.EMPLOYEE];
      default:
        throw new BadRequestException('The provided employee type is invalid');
    }
  };

  getRescueTeamCategory = (category: string) => {
    switch (category.toUpperCase()) {
      case ERescueTeamCategory[ERescueTeamCategory.IMMEASUREY]:
        return ERescueTeamCategory[ERescueTeamCategory.IMMEASUREY];
      case ERescueTeamCategory[ERescueTeamCategory.POLICE]:
        return ERescueTeamCategory[ERescueTeamCategory.POLICE];
      case ERescueTeamCategory[ERescueTeamCategory.RED_CROSS]:
        return ERescueTeamCategory[ERescueTeamCategory.RED_CROSS];
      default:
        throw new BadRequestException(
          'The rescue team category provided is invalid',
        );
    }
  };

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
        throw new BadRequestException({
          sucess: false,
          message: error.message,
        });
      const details: any = await this.jwtService.decode(token);
      switch (type.toUpperCase()) {
        case EAccountType[EAccountType.COMPANY]:
          user = await this.miningCompanyService.getEmployeeById(details.id);
          break;
        case EAccountType[EAccountType.RMB]:
          user = await this.rmbEmployeeService.getRMBEmployeeById(details.id);
          break;
        case EAccountType[EAccountType.RESCUE_TEAM]:
          await this.rescueTeamService.getEmployeeById(details.id);
          break;
        default:
          throw new BadRequestException(
            'The provided user type to decode is invalid',
          );
      }
      return user;
    } else {
      throw new Exception('Please you are not authorized to access resource');
    }
  }
}
