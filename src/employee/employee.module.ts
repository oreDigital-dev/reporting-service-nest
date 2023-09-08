import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from 'src/entities/employee.enity';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), UtilsModule],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
