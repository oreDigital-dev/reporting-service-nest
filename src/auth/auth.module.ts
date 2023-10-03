import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { UtilsModule } from 'src/utils/utils.module';
import { EmployeeModule } from 'src/employees/employee.module';
import { RmbModule } from 'src/rmb/rmb.module';
import { RescueTeamsModule } from 'src/rescue-teams/rescue-teams.module';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => UtilsModule),
    forwardRef(() => EmployeeModule),
    forwardRef(() => RmbModule),
    RescueTeamsModule,
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    { provide: 'APP_GUARD', useClass: AuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
