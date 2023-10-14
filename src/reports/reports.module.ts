import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from 'src/entities/report.entity';
import { UtilsModule } from 'src/utils/utils.module';
import { MinesiteModule } from 'src/minesite/minesite.module';
import { EmployeeModule } from 'src/employees/employee.module';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    UtilsModule,
    MinesiteModule,
    EmployeeModule,
    FilesModule,
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
