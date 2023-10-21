import { Module } from '@nestjs/common';
import { ConcessionsService } from './concessions.service';
import { ConcessionsController } from './concessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concession } from 'src/entities/concession.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { AddressModule } from 'src/address/address.module';

@Module({
  imports: [TypeOrmModule.forFeature([Concession]), UtilsModule, AddressModule],
  providers: [ConcessionsService],
  controllers: [ConcessionsController],
  exports: [ConcessionsService],
})
export class ConcessionsModule {}
