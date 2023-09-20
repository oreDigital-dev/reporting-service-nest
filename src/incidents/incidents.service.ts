import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Request, Response } from 'express';
import { Exception } from 'handlebars';
import { async } from 'rxjs';
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
import { MailingService } from 'src/mailing/mailing.service';
import { MinesiteService } from 'src/minesite/minesite.service';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
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
    private mailingService: MailingService,
    private employeeService: EmployeeService,
  ) {}

  async saveIncident(dto: CreateIncidentDTO) {
    let incident = new Incident(EIncidentType[dto.type], dto.measurement);
    let minesite: any = await this.minesiteService.getMineSiteById(
      dto.mineSite,
    );
    incident.mineSite = minesite;

    const employees = await this.employeeService.employeeRepo.find({
      where: { company: minesite.company },
      relations: ['roles'],
    });
    if (dto.type == EIncidentType.AIR_QUALITY.toString()) {
      if (dto.measurement < 14) {
        incident.status = EIncidentStatus[EIncidentStatus.DANGER];
        employees.map(async (employee) => {
          await this.notificationService.NotifyEmployee(
            employee,
            `${minesite.name}'s air quality is at the lowest!`,
            'company',
          );
          await this.mailingService.sendPhoneSMSTOUser(
            employee.phonenumber,
            `Helllo ${employee.lastName}, we are regretting to let you ${minesite.name}'s air quality is at the lowest! please provide imediate support`,
          );
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `Helllo ${employee.lastName}, we are regretting to let you ${minesite.name}'s air quality is at the lowest! please provide imediate support`,
              '',
              incident,
            );
          });
        });
      } else if (dto.measurement > 18) {
        incident.status = EIncidentStatus[EIncidentStatus.DANGER];
        employees.forEach(async (employee) => {
          await this.notificationService.NotifyEmployee(
            employee,
            `${minesite.name}'s temperature is at the highest!`,
            'company',
          );
          await this.mailingService.sendPhoneSMSTOUser(
            employee.phonenumber,
            `Helllo ${employee.lastName}, we are regretting to let you  ${minesite.name}'s temperature is at the highest! please provide imediate support`,
          );
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `Helllo ${employee.lastName}, we are regretting to let you  ${minesite.name}'s temperature is at the highest! please provide imediate support`,
              '',
              incident,
            );
          });
        });
      }
    } else if (dto.type == EIncidentType.LANDSLIDES.toString()) {
      if (dto.measurement < 14) {
        employees.forEach(async (employee) => {
          await this.notificationService.NotifyEmployee(
            employee,
            `${minesite.name} reports landslide occurrence!`,
            'company',
          );
          await this.mailingService.sendPhoneSMSTOUser(
            employee.phonenumber,
            `Helllo ${employee.lastName}, we are regretting to let you  ${minesite.name} reports landslide occurrence! please provide imediate support`,
          );
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `Helllo ${employee.lastName}, we are regretting to let you  ${minesite.name} reports landslide occurrence! please provide imediate support`,
              '',
              incident,
            );
          });
        });
      }
    }
    return await this.incidentRepo.save(incident);
  }

  async saveMiniIncident(dto: CreateMiniIncidentDTO) {
    let incident = new MiniIncident(EIncidentType[dto.type], true);
    let createdIncident;

    let minesite: any = await this.minesiteService.getMineSiteById(
      dto.originMineSite,
    );
    incident.mineSite = minesite;

    const employees = await this.employeeService.employeeRepo.find({
      where: { company: minesite.company },
      relations: ['roles'],
    });

    if (dto.isHappened == 1) {
      createdIncident = await this.minIncidentRepo.save(incident);
      switch (dto.type.toUpperCase()) {
        case EIncidentType[EIncidentType.LANDSLIDES]:
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `At ${incident.createdAt} in  ${minesite.name}' happened landslides which might cause loss of lives of peaples !`,
              '',
              createdIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `At ${incident.createdAt} in  ${minesite.name}' happened landslides which might cause loss of lives of peaples !`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              '0798782003',
              `Helllo ${employee.lastName}, we are regretting to let you know that   At ${incident.createdAt} in  ${minesite.name}' happened landslides which might cause loss of lives of peaples ! please provide imediate support`,
            );
          });

          break;
        case EIncidentType[EIncidentType.AIR_QUALITY]:
          createdIncident.mineSite.company.employees.forEach((employee) => {
            employee.roles.forEach(async (role) => {
              await this.mailingService.sendIncidentNotification(
                employee.email,
                employee.lastName,
                `At  ${minesite.name}' There  very law air quality  which might cause loss of lives of peaples !`,
                '',
                createdIncident,
              );

              await this.notificationService.NotifyEmployee(
                employee,
                `At  ${minesite.name}' There  very law air quality  which might cause loss of lives of peaples !`,
                'company',
              );
              await this.mailingService.sendPhoneSMSTOUser(
                employee.phonenumber,
                `Helllo ${employee.lastName}, we are regretting to let you know that   At  ${minesite.name}' There  very law air quality   which might cause loss of lives of peaples ! please provide imediate support`,
              );
            });
          });
        case EIncidentType[EIncidentType.LIGHT]:
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `${minesite.name}'  mine site  has law light intensity! this  might cause loss of lives of employees, please seriuos measures are needed !`,
              '',
              createdIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `${minesite.name}'  mine site  has law light intensity! this  might cause loss of lives of employees, please seriuos measures are needed !`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, we are regretting to let you know that   At  ${minesite.name}'  mine site  has law light intensity! please provide imediate support`,
            );
          });

          break;
        case EIncidentType[EIncidentType.WATER_LEVEL]:
          createdIncident.mineSite.company.employees.forEach((employee) => {
            employee.roles.forEach(async (role) => {
              await this.mailingService.sendIncidentNotification(
                employee.email,
                employee.lastName,
                `Water level at ${minesite.name}'  mine site is increasing ! this  might cause loss of lives of employees, please seriuos measures are needed !`,
                '',
                createdIncident,
              );
              await this.notificationService.NotifyEmployee(
                employee,
                `Water level at ${minesite.name}'  mine site is increasing ! this  might cause loss of lives of employees, please seriuos measures are needed !`,
                'company',
              );
              await this.mailingService.sendPhoneSMSTOUser(
                employee.phonenumber,
                `Helllo ${employee.lastName}, we are regretting to let you know that   At  ${minesite.name}'  mine site is increasing ! please provide imediate support`,
              );
            });
          });
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

      let minesite: any = await this.minesiteService.getMineSiteById(
        dto.origin,
      );
      createIncident.mineSite = minesite;

      const employees = await this.employeeService.employeeRepo.find({
        where: { company: minesite.company },
        relations: ['roles'],
      });
      if (createIncident.type == EIncidentType[EIncidentType.TEMPERATURE]) {
        if (createIncident.measurement > 18) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `There is hight temperature in one of your minesites, please help is needed for employees security there`,
              '',
              createIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `There is hight temperature in one of your minesites, please help is needed for employees security there`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, As oreDigital we There is hight temperature in one of your minesites, please help is needed for employees security there`,
            );
          });
        } else if (createIncident.measurement < 17) {
          await this.incidentRepo.update(
            {
              id: createIncident.id,
            },
            {
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );
          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `There is law temperature in one of your minesites, please help is needed for employees security there`,
              '',
              createIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `There is law temperature in one of your minesites, please help is needed for employees security there`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, As oreDigital we are regrerring to let you be aware that  There is law temperature in one of your minesites, please help is needed for employees security there`,
            );
          });
          this.notificationService.notify(
            'COMPANY',
            new CreateNotificationDTO(
              `${createIncident.mineSite.name} minesite is at a low temperature`,
              'COMPANY',
            ),
            createIncident.mineSite.company.id,
          );
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

          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `There is very law humidity in one of your minesites, please help is needed for employees security there`,
              '',
              createIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `There is very law humidity in one of your minesites, please help is needed for employees security there`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, As oreDigital we are regrerring to let you be aware that  There is very law humidity in one of your minesites, please help is needed for employees security there`,
            );
          });
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
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );

          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `There is very high humidity in one of your minesites, please help is needed for employees security there`,
              '',
              createIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `There is very high humidity in one of your minesites, please help is needed for employees security there`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, As oreDigital we are regrerring to let you be aware that  There is very high humidity in one of your minesites, please help is needed for employees security there`,
            );
          });
          this.notificationService.notify(
            'COMPANY',
            new CreateNotificationDTO(
              `${createIncident.mineSite.name} minesite is at a high humidity`,
              'COMPANY',
            ),
            createIncident.mineSite.company.id,
          );
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

          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `There is very law humidity in one of your minesites, please help is needed for employees security there`,
              '',
              createIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `There is very law humidity in one of your minesites, please help is needed for employees security there`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, As oreDigital we are regrerring to let you be aware that  There is very law humidity in one of your minesites, please help is needed for employees security there`,
            );
          });
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
              status: EIncidentStatus[EIncidentStatus.DANGER],
            },
          );

          employees.forEach(async (employee) => {
            await this.mailingService.sendIncidentNotification(
              employee.email,
              employee.lastName,
              `There is very high humidity in one of your minesites, please help is needed for employees security there`,
              '',
              createIncident,
            );
            await this.notificationService.NotifyEmployee(
              employee,
              `There is very high humidity in one of your minesites, please help is needed for employees security there`,
              'company',
            );
            await this.mailingService.sendPhoneSMSTOUser(
              employee.phonenumber,
              `Helllo ${employee.lastName}, As oreDigital we are regrerring to let you be aware that  There is very high humidity in one of your minesites, please help is needed for employees security there`,
            );
          });
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
      let loggedInCompany: MiningCompanyEmployee =
        await this.utilService.getLoggedInProfile(req, 'company');
      let minesites: any = await this.minesiteService.getMinesitesByCompany(
        loggedInCompany.company,
      );

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
