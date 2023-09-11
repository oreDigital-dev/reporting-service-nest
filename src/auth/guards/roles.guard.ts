import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/us.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(ConfigService) private configService: ConfigService,
    @Inject(UsersService) private userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<String[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization;
    let user: User = null;
    if (authorization) {
      const token = authorization.split(' ')[1];
      if (!authorization.toString().startsWith('Bearer '))
        throw new UnauthorizedException('The provided token is invalid');
      const { tokenVerified, error } = this.jwtService.verify(token, {
        secret: this.configService.get('SECRET_KEY'),
      });
      if (error) throw new UnauthorizedException(error.message);
      const details: any = await this.jwtService.decode(token);
      user = await this.userService.getUserById(details.id, 'User');
    }

    let type: boolean = false;
    user.roles.forEach((role1: Role) => {
      requiredRoles.forEach((requiredRole: String) => {
        if (requiredRole.toUpperCase() == role1.roleName) {
          type = true;
        }
      });
    });
    if (type == false)
      throw new UnauthorizedException(
        `This resource is only for ${requiredRoles
          .toLocaleString()
          .toUpperCase()}`,
      );
    return type;
  }
}
