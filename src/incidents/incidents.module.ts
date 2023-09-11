import { Module, forwardRef } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { MailingModule } from 'src/mailing/mailing.module';
import { RolesModule } from 'src/roles/roles.module';
import { Incident } from 'src/entities/incident.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [MailingModule, RolesModule, TypeOrmModule.forFeature([Incident])],
  controllers: [IncidentsController],
  providers: [IncidentsService],
})
export class IncidentsModule {}
