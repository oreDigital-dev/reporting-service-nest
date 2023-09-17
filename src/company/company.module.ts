import { Global, Module, forwardRef } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from 'src/address/address.module';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsModule } from 'src/utils/utils.module';
import { MineralModule } from 'src/mineral/mineral.module';
import { MailingModule } from 'src/mailing/mailing.module';
import { EmployeeModule } from 'src/miningCompanyEmployee/employee.module';
import { RolesModule } from 'src/roles/roles.module';
import { MiningCompany } from 'src/entities/miningCompany.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([MiningCompany]),
    AddressModule,
    MailingModule,
    forwardRef(() => EmployeeModule),
    forwardRef(() => AuthModule),
    MineralModule,
    forwardRef(() => UtilsModule),
    forwardRef(() => EmployeeModule),
    RolesModule,
    MailingModule,
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
