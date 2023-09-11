import { Module } from '@nestjs/common';
import { MineralController } from './mineral.controller';
import { MineralService } from './mineral.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mineral } from 'src/entities/mineral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mineral])],
  controllers: [MineralController],
  providers: [MineralService],
  exports: [MineralService],
})
export class MineralModule {}
