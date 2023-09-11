import { Module, forwardRef } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { Employee } from 'src/entities/employee.enity';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    forwardRef(() => EmployeeModule),
    forwardRef(() => UsersModule),
  ],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}
