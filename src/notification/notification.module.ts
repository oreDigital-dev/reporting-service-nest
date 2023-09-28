import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { CompanyModule } from 'src/company/company.module';
import { EmployeeModule } from 'src/employees/employee.module';
import { RmbModule } from 'src/rmb/rmb.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    CompanyModule,
    EmployeeModule,
    RmbModule,
    UtilsModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
