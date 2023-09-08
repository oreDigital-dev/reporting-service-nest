import { Module } from '@nestjs/common';
import { MinesiteController } from './minesite.controller';
import { MinesiteService } from './minesite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MineSite } from 'src/entities/minesite.entity';
import { AddressModule } from 'src/address/address.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
  imports: [TypeOrmModule.forFeature([MineSite]), AddressModule, CompanyModule],
  controllers: [MinesiteController],
  providers: [MinesiteService],
  exports: [MinesiteService],
})
export class MinesiteModule {}
