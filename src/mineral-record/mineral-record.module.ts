import { Module } from '@nestjs/common';
import { MineralRecordService } from './mineral-record.service';
import { MineralRecordController } from './mineral-record.controller';

@Module({
  providers: [MineralRecordService],
  controllers: [MineralRecordController]
})
export class MineralRecordModule {}
