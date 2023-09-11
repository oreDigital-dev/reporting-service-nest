import { Module } from '@nestjs/common';
import { MineralController } from './mineral.controller';
import { MineralService } from './mineral.service';
import { Mineral } from 'src/entities/mineralRecord.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Mineral])],
  controllers: [MineralController],
  providers: [MineralService],
  exports: [MineralService],
})
export class MineralModule {}
