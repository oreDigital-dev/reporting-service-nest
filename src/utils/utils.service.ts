import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CompanyService } from 'src/company/company.service';
import { Main } from 'src/entities/main.entity';
import { User } from 'src/entities/us.entity';
import { EAccountType } from 'src/enums/EAccountType.enum';
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
  ) {}

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
        expiresIn: '10m',
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
      const hashed = await hash(input, 10);
      return hashed;
    } catch (error) {
      console.error('Error occurred while hashing:', error.message);
      throw error;
    }
  }

  idValidator(id: String): boolean {
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id.toString());
  }

  async getLoggedInProfile(req: Request, res: Response) {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.split(' ')[1];
      if (!authorization.toString().startsWith('Bearer '))
        throw new UnauthorizedException('The provided token is invalid');
      const { tokenVerified, error } = this.jwtService.verify(token, {
        secret: this.configService.get('SECRET_KEY'),
      });
      if (error)
        return res.status(403).json({ sucess: false, message: error.message });
      const details: any = await this.jwtService.decode(token);
      return await this.userService.getUserById(details.id, 'User');
    } else {
      return res.status(403).json({
        sucess: false,
        message: 'Please you are not authorized to access resource',
      });
    }
  }
}
