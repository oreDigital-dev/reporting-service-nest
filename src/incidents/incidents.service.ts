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
      let incident = new Incident(dto.type, dto.measurement);
      let minesite = await this.minesiteService.getMineSiteById(dto.mineSite);
      incident.mineSite = minesite;

      if (dto.type == EIncidentType[EIncidentType.AIR_QUALITY]) {
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
      } else if (dto.type == EIncidentType[EIncidentType.LANDSLIDES]) {
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

  async getIncidentByLoggedInCompany(req: Request, res: Response) {
    try {
      let owner: any = await this.utilService.getLoggedInProfile(req, res);
      const loggedInCompany: any = this.companyService.getCompanyByEmail(
        owner.email,
      );
      let incidents = await this.incidentRepo.findBy({
        mineSite: In(loggedInCompany.mineSites),
      });
      return incidents;
    } catch (err) {
      throw new Exception(err);
    }
  }

  async getAllIncidents() {
    try {
      return await this.incidentRepo.find({});
    } catch (error) {
      throw error;
    }
  }

  async CreateCombinedIncidents(dto: CombinedIncidentDTO) {
    const mineSite = await this.minesiteService.getMineSiteById(
      dto.originMineSiteId,
    );
    // if (!mineSite)
    //   throw new BadRequestException(
    //     'The mineSite with the provided id is not found',
    //   );

    const incidents: Incident[] = [
      new Incident(EIncidentType[EIncidentType.HUMIDITY], dto.humidityVaue),
      new Incident(EIncidentType[EIncidentType.HEATINDEX], dto.heatIndexValue),
      new Incident(
        EIncidentType[EIncidentType.TEMPERATURE],
        dto.temperatureValue,
      ),
    ];

    incidents.forEach(async (incident) => {
      await this.incidentRepo.save(incident);
    });
  }
}
