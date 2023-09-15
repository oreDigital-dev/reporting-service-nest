import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { UtilsModule } from 'src/utils/utils.module';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => UtilsModule),
    EmployeeModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
