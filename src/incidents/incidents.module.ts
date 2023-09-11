import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { MailingModule } from 'src/mailing/mailing.module';
import { UtilsModule } from 'src/utils/utils.module';
import { RolesModule } from 'src/roles/roles.module';
import { Incident } from 'src/entities/incident.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinesiteModule } from 'src/minesite/minesite.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MailingModule,
    UtilsModule,
    RolesModule,
    MinesiteModule,
    NotificationModule,
    TypeOrmModule.forFeature([Incident])
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService]
})
export class IncidentsModule {}
