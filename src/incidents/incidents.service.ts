import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Exception } from 'handlebars';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { CreateNotificationDTO } from 'src/dtos/create-notification.dto';
import { Incident } from 'src/entities/incident.entity';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import { MinesiteService } from 'src/minesite/minesite.service';
import { NotificationService } from 'src/notification/notification.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident) public incidentRepo: Repository<Incident>,
    private utilService: UtilsService,
    private minesiteService: MinesiteService,
    private notificationService: NotificationService
  ) { }

  async saveIncident(dto: CreateIncidentDTO) {
    try {
      if (!this.utilService.idValidator(dto.mineSite)) throw new BadRequestException("The provided id is invalid!")
      let incident = new Incident(dto.type, dto.measurement);
      let minesite = await this.minesiteService.getMineSiteById(dto.mineSite)
      incident.mineSite = minesite;

      if (dto.type == EIncidentType.AIR_QUALITY) {
        if (dto.measurement < 14) {
          incident.status = EIncidentStatus.DANGER;
          await this.notificationService.notify(ENotificationType['COMPANIES_AND_REPORTS'], new CreateNotificationDTO(`${minesite.name}'s temperature is at the lowest!`, 'COMPANY'), minesite.company.id)
        } else if (dto.measurement > 18) {
          incident.status = EIncidentStatus.DANGER;
          await this.notificationService.notify(ENotificationType['COMPANIES_AND_REPORTS'], new CreateNotificationDTO(`${minesite.name}'s temperature is at the highest!`, 'COMPANY'), minesite.company.id)
        }
      } else if (dto.type == EIncidentType.LANDSLIDES) {
        if (dto.measurement < 14) {
          await this.notificationService.notify(ENotificationType['COMPANIES_AND_REPORTS'], new CreateNotificationDTO(`${minesite.name} reports landslide occurrence!`, 'COMPANY'), minesite.company.id)
        }
      }
      this.incidentRepo.save(incident);
    } catch (err) {
      throw new Exception(err);
    }
  }

  // getIncidentByLoggedInCompany(req: Request, res: Response){
  //   try{
  //     let loggedInCompany = await this.utilService.getLoggedInProfile(req,res, 'company' );
  //     let incidents = await this.incidentRepo.findBy({
        
  //     })
  //   }
  // }

}
