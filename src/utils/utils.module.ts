import { Module, forwardRef } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { EmployeeModule } from 'src/miningCompanyEmployee/employee.module';
import { AuthModule } from 'src/auth/auth.module';
import { RmbModule } from 'src/rmb/rmb.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    EmployeeModule,
    forwardRef(() => RmbModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
