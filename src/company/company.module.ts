import { Global, Module, forwardRef } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from 'src/address/address.module';
import { Company } from 'src/entities/company.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UtilsService } from 'src/utils/utils.service';
import { UtilsModule } from 'src/utils/utils.module';
import { MineralModule } from 'src/mineral/mineral.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    AddressModule,
    AuthModule,
    forwardRef(() => UtilsModule),
    MineralModule
  ],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
