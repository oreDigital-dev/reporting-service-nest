import { Module } from '@nestjs/common';
import { MiningCompanyService } from './mining-company.service';
import { MiningCompanyController } from './mining-company.controller';

@Module({
  providers: [MiningCompanyService],
  controllers: [MiningCompanyController]
})
export class MiningCompanyModule {}
