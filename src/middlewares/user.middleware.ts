import {
  BadRequestException,
  ExecutionContext,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request } from 'express';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class UserMiddleWare implements NestMiddleware {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(UsersService) private readonly userService: UsersService,
    @Inject(EmployeeService) private readonly employeeService: EmployeeService,
    @Inject(RmbService) private readonly rmbService: RmbService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    let context: ExecutionContext;
    const request = req;
    console.log(request.headers);
    const authorization = req.headers.authorization;
    console.log("Authorization", authorization)
    if (
      req.baseUrl == '' ||
      req.baseUrl == '/favicon.ico' ||
      req.baseUrl == '/auth/login' ||
      req.baseUrl == '/auth/verify_account' ||
      req.baseUrl == '/auth/reset_password' ||
      req.baseUrl == '/api/swagger-docs.html' ||
      req.baseUrl == '/rmb/create/system-admin' ||
      req.baseUrl == '/companies/create' ||
      req.baseUrl == '/users/create/system-admin' ||
      req.baseUrl == '/incidents/create' ||
      req.baseUrl == '/incidents/create-combined' ||
      req.baseUrl == '/employees/create'
    ) {
      next();
    } else {
      if (authorization) {
        const token = authorization.toString().split(' ')[1];
        console.log("token", token )
        if (!authorization.toString().startsWith('Bearer '))
          throw new UnauthorizedException('The provided token is invalid');
        const { tokenVerified, error } = this.jwtService.verify(token, {
          secret: this.configService.get('SECRET_KEY'),
        });
        if (error) throw new UnauthorizedException(error.message);
        const details: any = await this.jwtService.decode(token);

        let user: any;
        switch (details.type.toUpperCase()) {
          case 'COMPANY':
            user = await this.employeeService.getEmployeeById(details.id);
            break;
          case 'RMB':
            user = await this.rmbService.rmbRepo.findOne({
              where: { id: details.id },
            });
            break;
          case 'RESCUE_TEAM':
            user = await this.employeeService.getEmployeeById(details.id);
            break;
          default:
            throw new BadRequestException(
              'The provided  entity type is not defined',
            );
        }
        req['user'] = user;
        next();
      } else {
        throw new UnauthorizedException('Please get authenticated first');
      }
    }
  }
}
