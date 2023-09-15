import { Module, forwardRef } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from 'src/utils/utils.module';
import { MailingModule } from 'src/mailing/mailing.module';
import { CompanyModule } from 'src/company/company.module';
import { RolesModule } from 'src/roles/roles.module';
import { Employee } from 'src/entities/employee.enity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    forwardRef(() => UtilsModule),
    forwardRef(() => MailingModule),
    MailingModule,
    forwardRef(() => CompanyModule),
    RolesModule,
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
