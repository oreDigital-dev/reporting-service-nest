import { Module } from '@nestjs/common';
import { MinesiteController } from './minesite.controller';
import { MinesiteService } from './minesite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MineSite } from 'src/entities/minesite.entity';
import { AddressModule } from 'src/address/address.module';
import { CompanyModule } from 'src/company/company.module';
import { UtilsModule } from 'src/utils/utils.module';
import { MineralModule } from 'src/mineral/mineral.module';
import { ConcessionsModule } from 'src/concessions/concessions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MineSite]),
    AddressModule,
    CompanyModule,
    UtilsModule,
    MineralModule,
    ConcessionsModule,
  ],
  controllers: [MinesiteController],
  providers: [MinesiteService],
  exports: [MinesiteService],
})
export class MinesiteModule {}
