import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { MainUser } from 'src/entities/MainUser.entity';
import { UsersService } from 'src/users/users.service';
import { RmbService } from 'src/rmb/rmb.service';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { EmployeeService } from 'src/employees/employee.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    @Inject(UsersService) private userService: UsersService,
    @Inject(EmployeeService) private employeeService: EmployeeService,
    @Inject(RmbService) private rmbService: RmbService,
    @Inject(RescueTeamsService) private rescueTeamService: RescueTeamsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    try {
      const req = context.switchToHttp().getRequest();
      const authorization = req.headers.authorization;
      let user: MainUser = null;
      if (authorization) {
        const token = authorization.split(' ')[1];
        if (!authorization.toString().startsWith('Bearer '))
          throw new UnauthorizedException('The provided token is invalid');
        const { tokenVerified, error } = this.jwtService.verify(token, {
          secret: this.configService.get('SECRET_KEY'),
        });
        if (error) throw new UnauthorizedException(error.message);
        const details: any = await this.jwtService.decode(token);

        switch (details.type.toUpperCase()) {
          case 'COMPANY':
            user = await this.employeeService.getEmployeeById(details.id);
            break;
          case 'RMB':
            user = await this.rmbService.rmbRepo.findOne({
              where: { id: details.id },
              relations: ['roles'],
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
      }
      req['user'] = user;
    } catch (e) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource',
      );
    }
    return true;
  }
}
