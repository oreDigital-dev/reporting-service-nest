import { Module, forwardRef } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from 'src/utils/utils.module';
import { MailingModule } from 'src/mailing/mailing.module';
import { CompanyModule } from 'src/company/company.module';
import { RolesModule } from 'src/roles/roles.module';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { AddressModule } from 'src/address/address.module';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { RescueTeamsModule } from 'src/rescue-teams/rescue-teams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MiningCompanyEmployee]),
    TypeOrmModule.forFeature([RMBEmployee]),
    TypeOrmModule.forFeature([RescueTeamEmployee]),
    forwardRef(() => UtilsModule),
    forwardRef(() => MailingModule),
    MailingModule,
    forwardRef(() => CompanyModule),
    RolesModule,
    AddressModule,
    RescueTeamsModule,
  ],
  providers: [EmployeeService],
  controllers: [EmployeeController],
  exports: [EmployeeService],
})
export class EmployeeModule {}
