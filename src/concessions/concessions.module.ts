import { Module } from '@nestjs/common';
import { ConcessionsService } from './concessions.service';
import { ConcessionsController } from './concessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Concession } from 'src/entities/concession.entity';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([Concession]), UtilsModule],
  providers: [ConcessionsService],
  controllers: [ConcessionsController],
  exports: [ConcessionsService],
})
export class ConcessionsModule {}
