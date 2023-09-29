import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { UtilsModule } from 'src/utils/utils.module';
import { EmployeeModule } from 'src/employees/employee.module';
import { RmbModule } from 'src/rmb/rmb.module';
import { RescueTeamsModule } from 'src/rescue-teams/rescue-teams.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => UtilsModule),
    forwardRef(() => EmployeeModule),
    forwardRef(() => RmbModule),
    RescueTeamsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
