import { Module, forwardRef } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { Employee } from 'src/entities/employee.entity';
import { EmployeeModule } from 'src/employee/employee.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    forwardRef(() => EmployeeModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
