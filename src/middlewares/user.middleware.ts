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
import { EmployeeService } from 'src/employees/employee.service';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
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
    @Inject(RescueTeamsService)
    private readonly rescueTeamService: RescueTeamsService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
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
      req.baseUrl == '/employees/create' ||
      req.baseUrl == '/rmb/create/rmb-employee' ||
      req.baseUrl == '/rescue-teams/create' ||
      req.baseUrl == '/incidents/min-incidents/create'
    ) {
      next();
    } else {
      if (authorization) {
        const token = authorization.toString().split(' ')[1];
        if (!authorization.toString().startsWith('Bearer '))
          throw new UnauthorizedException('The provided token is invalid');
        let details: any;
        try {
          const { tokenVerified, error } = this.jwtService.verify(token, {
            secret: this.configService.get('SECRET_KEY'),
          });
          details = await this.jwtService.decode(token);
        } catch (error) {
          if (error.name === 'TokenExpiredError') {
            throw new BadRequestException('Token has expired');
          } else {
            throw new UnauthorizedException('Token is invalid');
          }
        }
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
            user = await this.rescueTeamService.getEmployeeById(details.id);
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
