import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from 'src/address/address.module';
import { Company } from 'src/entities/company.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AddressService } from 'src/address/address.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    AddressModule,
    AuthModule
  ],
  providers: [CompanyService],
  controllers: [CompanyController]
})
export class CompanyModule {}
