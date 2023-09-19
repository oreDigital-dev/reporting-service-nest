import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CompanyService } from 'src/company/company.service';
import { CreateNotificationDTO } from 'src/dtos/create-notification.dto';
import { CreateBulkyNotificationDTO } from 'src/dtos/create_buky-notifications.dto';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { Notification } from 'src/entities/notification.entity';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { RmbService } from 'src/rmb/rmb.service';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  activeUsers = {};
  constructor(
    @InjectRepository(Notification)
    public notificationRepo: Repository<Notification>,
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private rmbService: RmbService, // private rescueTeamService
  ) {}
  async notify(type: string, dto: CreateNotificationDTO, id: UUID) {
    if (type == 'COMPANY') {
      let company = await this.companyService.getCompanyById(id);
      let notifications = company.notifications;
      let notification = new Notification(
        dto.message,
        ENotificationType[dto.type],
      );
      notification = await this.notificationRepo.save(notification);
      notifications.push(notification);
      company.notifications = notifications;
      notification.miningCompany = company;
      this.companyService.saveCompany(company);
    }
  }

  async NotifyBulky(
    company: MiningCompanyEmployee,
    rescue_team: RescueTeamEmployee,
    rmb: RMBEmployee,
    dto: CreateBulkyNotificationDTO,
  ) {
    const notifications = [
      new Notification(
        dto.companyMessage,
        ENotificationType.COMPANY_NOTIFICATION,
      ),
      new Notification(
        dto.rescueTeamMessage,
        ENotificationType.RESCUE_TEAM_NOTIFICATION,
      ),
      new Notification(dto.rmbMessage, ENotificationType.RMB_NOTIFICATION),
    ];

    let createdNotification;
    let organizationNotifications = [];

    notifications.map(async (notification) => {
      switch (notification.type) {
        case ENotificationType.COMPANY_NOTIFICATION:
          organizationNotifications = company.notifications;
          createdNotification = await this.notificationRepo.save(notification);
          organizationNotifications.push(createdNotification);
          company.notifications = organizationNotifications;
          createdNotification.miningCompany = company;
          await this.employeeService.createEmp(company);
          break;
        case ENotificationType.RMB_NOTIFICATION:
          organizationNotifications = rmb.notifications;
          createdNotification = await this.notificationRepo.save(notification);
          organizationNotifications.push(createdNotification);
          rmb.notifications = organizationNotifications;
          createdNotification.rmb = rmb;
          await this.rmbService.rmbRepo.save(rmb);
          break;
        case ENotificationType.RESCUE_TEAM_NOTIFICATION:
          break;
        default:
          throw new BadRequestException(
            'The provided notification type is invalid',
          );
      }
    });
  }

  async sendNotification(data: CreateNotificationDTO) {
    let user;
    let newNotification;

    if (this.activeUsers[data.to]) {
    }
  }
}
