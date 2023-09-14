import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Exception } from 'handlebars';
import { CompanyService } from 'src/company/company.service';
import { CombinedIncidentDTO } from 'src/dtos/combined-incidents.dto';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { CreateNotificationDTO } from 'src/dtos/create-notification.dto';
import { Incident } from 'src/entities/incident.entity';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import { MinesiteService } from 'src/minesite/minesite.service';
import { NotificationService } from 'src/notification/notification.service';
import { UtilsService } from 'src/utils/utils.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident) public incidentRepo: Repository<Incident>,
    private utilService: UtilsService,
    private minesiteService: MinesiteService,
    private notificationService: NotificationService,
    private companyService: CompanyService,
  ) {}

  async saveIncident(dto: CreateIncidentDTO) {
    try {
      if (!this.utilService.idValidator(dto.mineSite))
        throw new BadRequestException('The provided id is invalid!');
      let incident = new Incident(EIncidentType[dto.type], dto.measurement);
      let minesite = await this.minesiteService.getMineSiteById(dto.mineSite);
      incident.mineSite = minesite;

      if (dto.type == EIncidentType.AIR_QUALITY.toString()) {
        if (dto.measurement < 14) {
          incident.status = EIncidentStatus.DANGER;
          await this.notificationService.notify(
            ENotificationType['COMPANIES_AND_REPORTS'],
            new CreateNotificationDTO(
              `${minesite.name}'s temperature is at the lowest!`,
              'COMPANY',
            ),
            minesite.company.id,
          );
        } else if (dto.measurement > 18) {
          incident.status = EIncidentStatus.DANGER;
          await this.notificationService.notify(
            ENotificationType['COMPANIES_AND_REPORTS'],
            new CreateNotificationDTO(
              `${minesite.name}'s temperature is at the highest!`,
              'COMPANY',
            ),
            minesite.company.id,
          );
        }
      } else if (dto.type == EIncidentType.LANDSLIDES.toString()) {
        if (dto.measurement < 14) {
          await this.notificationService.notify(
            ENotificationType['COMPANIES_AND_REPORTS'],
            new CreateNotificationDTO(
              `${minesite.name} reports landslide occurrence!`,
              'COMPANY',
            ),
            minesite.company.id,
          );
        }
      }
      this.incidentRepo.save(incident);
    } catch (err) {
      throw new Exception(err);
    }
  }

  async createIncident(dto: CreateIncidentDTO) {
    try {
      let incident = new Incident(EIncidentType[dto.type], dto.measurement);
      incident.mineSite = await this.minesiteService.getMineSiteById(
        dto.mineSite,
      );
      incident = await this.incidentRepo.save(incident);
      await this.minesiteService.addIncident(dto.mineSite, incident);
      return incident;
    } catch (err) {
      throw new Exception(err);
    }
  }

  async saveCombinedIncidents(dto: CombinedIncidentDTO) {
    const incidents: CreateIncidentDTO[] = [
      {
        measurement: dto.temperature,
        type: EIncidentType.TEMPERATURE.toString(),
        mineSite: dto.origin,
      },
      {
        measurement: dto.heatIndex,
        type: EIncidentType.HEATINDEX.toString(),
        mineSite: dto.origin,
      },
      {
        measurement: dto.humidity,
        type: EIncidentType.HUMIDITY.toString(),
        mineSite: dto.origin,
      },
    ];

    let i = 0;
    let createIncident: Incident;
    while (i < incidents.length) {
      createIncident = await this.createIncident(incidents[i]);
      if (createIncident.type == EIncidentType.TEMPERATURE) {
        if (createIncident.measurement > 17) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus.DANGER,
            },
          );
          this.notificationService.notify(
            'COMPANY',
            new CreateNotificationDTO(
              `${createIncident.mineSite.name} minesite is at its highest temperature`,
              'COMPANY',
            ),
            createIncident.mineSite.company.id,
          );
        } else if (createIncident.measurement < 17) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus.DANGER,
            },
          );
          this.notificationService.notify(
            'COMPANY',
            new CreateNotificationDTO(
              `${createIncident.mineSite.name} minesite is at a low temperature`,
              'COMPANY',
            ),
            createIncident.mineSite.company.id,
          );
        }
      } else if (createIncident.type == EIncidentType.HUMIDITY) {
        if (createIncident.measurement < 14) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus.DANGER,
            },
          );
          this.notificationService.notify(
            'COMPANY',
            new CreateNotificationDTO(
              `${createIncident.mineSite.name} minesite is at a low humidity`,
              'COMPANY',
            ),
            createIncident.mineSite.company.id,
          );
        } else if (createIncident.measurement > 18) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus.DANGER,
            },
          );
          this.notificationService.notify(
            'COMPANY',
            new CreateNotificationDTO(
              `${createIncident.mineSite.name} minesite is at a high humidity`,
              'COMPANY',
            ),
            createIncident.mineSite.company.id,
          );
        } else {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus.DANGER,
            },
          );
        }
        if (!createIncident || createIncident == null) {
          break;
        }
        i++;
      }
    }
    return await this.incidentRepo.find();
  }

  async getIncidentByLoggedInCompany(req: Request, res: Response) {
    // try {
    //   let loggedInCompany = await this.utilService.getLoggedInProfile(req, res);
    //   let incidents = await this.incidentRepo.findBy({
    //     mineSite: In(loggedInCompany.mineSites),
    //   });
    //   return incidents;
    // } catch (err) {
    //   throw new Exception(err);
    // }
  }
}
