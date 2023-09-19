import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Request, Response } from 'express';
import { Exception } from 'handlebars';
import { CompanyService } from 'src/company/company.service';
import { CombinedIncidentDTO } from 'src/dtos/combined-incidents.dto';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { CreateNotificationDTO } from 'src/dtos/create-notification.dto';
import { CreateMiniIncidentDTO } from 'src/dtos/create_mini-incident.dto';
import { Incident } from 'src/entities/incident.entity';
import { MiniIncident } from 'src/entities/mini-incident.entity';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
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
    @InjectRepository(MiniIncident)
    public minIncidentRepo: Repository<MiniIncident>,
    private utilService: UtilsService,
    private minesiteService: MinesiteService,
    private notificationService: NotificationService,
    private companyService: CompanyService,
  ) {}

  async saveIncident(dto: CreateIncidentDTO) {
    let incident = new Incident(EIncidentType[dto.type], dto.measurement);
    let minesite = await this.minesiteService.getMineSiteById(dto.mineSite);
    incident.mineSite = minesite;

    if (dto.type == EIncidentType.AIR_QUALITY.toString()) {
      if (dto.measurement < 14) {
        incident.status = EIncidentStatus[EIncidentStatus.DANGER];
        await this.notificationService.notify(
          ENotificationType['COMPANIES_AND_REPORTS'],
          new CreateNotificationDTO(
            `${minesite.name}'s temperature is at the lowest!`,
            'COMPANY',
          ),
          minesite.company.id,
        );
      } else if (dto.measurement > 18) {
        incident.status = EIncidentStatus[EIncidentStatus.DANGER];
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
    return await this.incidentRepo.save(incident);
  }

  async saveMiniIncident(dto: CreateMiniIncidentDTO) {
    let incident = new MiniIncident(EIncidentType[dto.type], true);
    let minesite = await this.minesiteService.getMineSiteById(
      dto.originMineSite,
    );
    incident.mineSite = minesite;
    let createdIncident;

    if (dto.isHappened == 1) {
      createdIncident = await this.minIncidentRepo.save(incident);
      switch (dto.type.toUpperCase()) {
        case EIncidentType[EIncidentType.LANDSLIDES]:
          await this.notificationService.notify(
            ENotificationType[ENotificationType.COMPANY_NOTIFICATION],
            new CreateNotificationDTO(
              `At ${incident.createdAt} in  ${minesite.name}' happened landslides which might cause loss of lives of peaples !`,
              'COMPANY',
            ),
            minesite.company.id,
          );
          break;
        case EIncidentType[EIncidentType.AIR_QUALITY]:
        case EIncidentType[EIncidentType.LANDSLIDES]:
          await this.notificationService.notify(
            ENotificationType[ENotificationType.COMPANY_NOTIFICATION],
            new CreateNotificationDTO(
              `At ${incident.createdAt} in  ${minesite.name}'  has law air quality  might cause loss of lives of employees, please seriuos measures are needed !`,
              'COMPANY',
            ),
            minesite.company.id,
          );
          break;
        case EIncidentType[EIncidentType.LIGHT]:
          await this.notificationService.notify(
            ENotificationType[ENotificationType.COMPANY_NOTIFICATION],
            new CreateNotificationDTO(
              `${minesite.name}'  mine site  has law light intensity! this  might cause loss of lives of employees, please seriuos measures are needed !`,
              'COMPANY',
            ),
            minesite.company.id,
          );
          break;
        case EIncidentType[EIncidentType.WATER_LEVEL]:
          await this.notificationService.notify(
            ENotificationType[ENotificationType.COMPANY_NOTIFICATION],
            new CreateNotificationDTO(
              `Water level at ${minesite.name}'  mine site is increasing ! this  might cause loss of lives of employees, please seriuos measures are needed !`,
              'COMPANY',
            ),
            minesite.company.id,
          );
          break;
        default:
          throw new BadRequestException(
            'The provided incident type is invalid',
          );
      }
    }
    return createdIncident;
  }

  async createIncident(dto: CreateIncidentDTO) {
    let incident = new Incident(dto.type, dto.measurement);
    incident.mineSite = await this.minesiteService.getMineSiteById(
      dto.mineSite,
    );
    incident = await this.incidentRepo.save(incident);
    return incident;
  }

  async saveCombinedIncidents(dto: CombinedIncidentDTO) {
    const incidents: CreateIncidentDTO[] = [
      {
        measurement: dto.temperature,
        type: EIncidentType[EIncidentType.TEMPERATURE],
        mineSite: dto.origin,
      },
      {
        measurement: dto.heatIndex,
        type: EIncidentType[EIncidentType.HEATINDEX],
        mineSite: dto.origin,
      },
      {
        measurement: dto.humidity,
        type: EIncidentType[EIncidentType.HUMIDITY],
        mineSite: dto.origin,
      },
    ];

    let i = 0;
    let createIncident: Incident;
    while (i < incidents.length) {
      createIncident = await this.createIncident(incidents[i]);
      if (createIncident.type == EIncidentType[EIncidentType.TEMPERATURE]) {
        if (createIncident.measurement > 17) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          // this.notificationService.notify(
          //   'COMPANY',
          //   new CreateNotificationDTO(
          //     `${createIncident.mineSite.name} minesite is at its highest temperature`,
          //     'COMPANY',
          //   ),
          //   createIncident.mineSite.company.id,
          // );
        } else if (createIncident.measurement < 17) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          // this.notificationService.notify(
          //   'COMPANY',
          //   new CreateNotificationDTO(
          //     `${createIncident.mineSite.name} minesite is at a low temperature`,
          //     'COMPANY',
          //   ),
          //   createIncident.mineSite.company.id,
          // );
        }
      } else if (createIncident.type == EIncidentType[EIncidentType.HUMIDITY]) {
        if (createIncident.measurement < 14) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          // this.notificationService.notify(
          //   'COMPANY',
          //   new CreateNotificationDTO(
          //     `${createIncident.mineSite.name} minesite is at a low humidity`,
          //     'COMPANY',
          //   ),
          //   createIncident.mineSite.company.id,
          // );
        } else if (createIncident.measurement > 18) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          // this.notificationService.notify(
          //   'COMPANY',
          //   new CreateNotificationDTO(
          //     `${createIncident.mineSite.name} minesite is at a high humidity`,
          //     'COMPANY',
          //   ),
          //   createIncident.mineSite.company.id,
          // );
        }
      } else if (createIncident.type == EIncidentType[EIncidentType.HUMIDITY]) {
        if (createIncident.measurement < 14) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          // this.notificationService.notify(
          //   'COMPANY',
          //   new CreateNotificationDTO(
          //     `${createIncident.mineSite.name} minesite is at a low humidity`,
          //     'COMPANY',
          //   ),
          //   createIncident.mineSite.company.id,
          // );
        } else if (createIncident.measurement > 18) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
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
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
        }
        if (!createIncident || createIncident == null) {
          break;
        }
      }
      i++;
    }
    return await this.incidentRepo.find();
  }

  async getAllIncidents() {
    return await this.incidentRepo.find({});
  }

  async getIncidentByLoggedInCompany(req: Request) {
    try {
      let loggedInCompany : MiningCompanyEmployee = await this.utilService.getLoggedInProfile(
        req,
        'company',
      );
      let minesites : any = await this.minesiteService.getMinesitesByCompany(loggedInCompany.company);

      let incidents = await this.incidentRepo.findBy({
        mineSite: In(minesites),
      });
      return incidents;
    } catch (err) {
      throw new Exception(err);
    }
  }

  async getIncidentById(id: UUID) {
    let incident = await this.incidentRepo.findOne({
      where: { id: id },
      relations: ['mineSite'],
    });
    if (!incident) {
      throw new BadRequestException('No data found!');
    }
    return incident;
  }
}
