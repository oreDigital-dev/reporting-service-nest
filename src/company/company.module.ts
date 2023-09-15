import { Global, Module, forwardRef } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from 'src/address/address.module';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsModule } from 'src/utils/utils.module';
import { MineralModule } from 'src/mineral/mineral.module';
import { MailingModule } from 'src/mailing/mailing.module';
import { EmployeeModule } from 'src/employee/employee.module';
import { MiningCompany } from 'src/entities/mining-company.entity';

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
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
