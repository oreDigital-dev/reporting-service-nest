import {
  BadRequestException,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { CompanyService } from 'src/company/company.service';
import { User } from 'src/entities/us.entity';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UtilsService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    @Inject(forwardRef(() => CompanyService))
    private companyService: CompanyService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async getTokens(
    user: User,
  ): Promise<{ accessToken: String; refreshToken: String }> {
    const accessToken: String = await this.jwtService.signAsync(
      { roles: user.roles, id: user.id, national_id: user.national_id },
      {
        expiresIn: '10m',
        secret: this.configService.get('SECRET_KEY'),
      },
    );
    const refreshToken: String = await this.jwtService.signAsync(
      { roles: user.roles, id: user.id, national_id: user.national_id },
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

  async hashString(input) {
    try {
      if (typeof input !== 'string') {
        throw new Error('Input must be a string');
      }
      const hash = await bcrypt.hash(input, 10);
      return hash;
    } catch (error) {
      console.error('Error occurred while hashing:', error.message);
      throw error;
    }
  }

  idValidator(id: String): boolean {
    const regex = /^[0-9a-fA-F]{24}$/;
    return regex.test(id.toString());
  }

  async getLoggedInProfile(req: Request, res: Response, type: String) {
    let context: ExecutionContext;
    const request = req;
    const authorization = req.headers.authorization;
    if (
      req.baseUrl == '' ||
      req.baseUrl == '/favicon.ico' ||
      req.baseUrl == '/auth/login' ||
      req.baseUrl == '/api/swagger-docs.html' ||
      req.baseUrl == '/users/create'
    ) {
    } else {
      if (authorization) {
        const token = authorization.split(' ')[1];
        if (!authorization.toString().startsWith('Bearer '))
          throw new UnauthorizedException('The provided token is invalid');
        const { tokenVerified, error } = this.jwtService.verify(token, {
          secret: this.configService.get('SECRET_KEY'),
        });
        if (error)
          return res
            .status(403)
            .json({ sucess: false, message: error.message });
        const details: any = await this.jwtService.decode(token);
        let entity:any;
        switch (type.toString().toUpperCase()) {
          case 'USER':
            entity = await this.userService.getUserById(details.id, 'User');
            break;
          case 'COMPANY':
            entity = await this.companyService.getCompanyById(details.id);
            break;
          default:
            throw new BadRequestException('Please provide valid entity type');
        }

        return entity;
      } else {
        return res.status(403).json({
          sucess: false,
          message: 'Please you are not authorized to access resource',
        });
      }
    }
  }
}
