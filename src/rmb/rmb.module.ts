import { Module } from '@nestjs/common';
import { RmbController } from './rmb.controller';
import { RmbService } from './rmb.service';

@Module({
  controllers: [RmbController],
  providers: [RmbService]
})
export class RmbModule {}
