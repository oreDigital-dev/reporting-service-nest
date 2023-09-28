import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CompanyService } from 'src/company/company.service';
import { CreateNotificationDTO } from 'src/dtos/create-notification.dto';
import { CreateBulkyNotificationDTO } from 'src/dtos/create_buky-notifications.dto';
import { MiningCompanyEmployee } from 'src/entities/miningCompany-employee.entity';
import { Notification } from 'src/entities/notification.entity';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import { EmployeeService } from 'src/employees/employee.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { MainUser } from 'src/entities/MainUser.entity';
import { Exception } from 'handlebars';

@Injectable()
export class NotificationService {
  activeUsers = {};
  constructor(
    @InjectRepository(Notification)
    public notificationRepo: Repository<Notification>,
    private companyService: CompanyService,
    private employeeService: EmployeeService,
    private rmbService: RmbService,
    private utilsService: UtilsService,
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

  async getAllNotifications() {
    return await this.notificationRepo.find({});
  }

  async getMyNotifications(req: Request, userType: string) {
    const loggedInProfile: any = await this.utilsService.getLoggedInProfile(
      req,
      userType,
    );
    return loggedInProfile.notifications;
  }
  async getNotificationsByUserId(id: UUID, userType: string) {
    let user: any;
    switch (userType.toString()) {
      case EAccountType[EAccountType.COMPANY]:
        user = await this.employeeService.getEmployeeById(id);
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        user = await this.employeeService.getEmployeeById(id);
        break;
      case EAccountType[EAccountType.RMB]:
        user = await this.rmbService.getRMBEmployeeById(id);
        break;
      default:
        throw new BadRequestException('The provided user type is invali');
    }
    if (user) return user.notifications;
  }

  async getMyLatestNotification(req: Request, userType: string) {
    const employee: any = await this.utilsService.getLoggedInProfile(
      req,
      userType,
    );
    return employee.notifications[employee.notifications.length - 1];
  }

  async NotifyEmployee(employee: MainUser, message: string, type: string) {
    console.log(employee);

    const employee2 = await this.employeeService.employeeRepo.findOne({
      where: { id: employee.id },
      relations: ['notifications'],
    });
    if (!employee2)
      throw new NotFoundException(
        'User to send the notification with that id is not found',
      );
    let notification;
    let notifications = employee2.notifications;
    switch (type.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        notification = new Notification(
          message,
          ENotificationType.COMPANY_NOTIFICATION,
        );
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        notification = new Notification(
          message,
          ENotificationType.RESCUE_TEAM_NOTIFICATION,
        );
        break;
      case EAccountType[EAccountType.RMB]:
        notification = new Notification(
          message,
          ENotificationType.RMB_NOTIFICATION,
        );
        break;
      default:
        throw new BadRequestException('The provided type is invalid');
    }
    let createdNotification = await this.notificationRepo.save(notification);
    notifications.push(createdNotification);
    employee.notifications = notifications;
    await this.employeeService.employeeRepo.save(employee);
  }

  async getLatestNotifictionByUserId(id: UUID, userType: string) {
    let user: any;
    switch (userType.toString()) {
      case EAccountType[EAccountType.COMPANY]:
        user = await this.employeeService.getEmployeeById(id);
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        user = await this.employeeService.getEmployeeById(id);
        break;
      case EAccountType[EAccountType.RMB]:
        user = await this.rmbService.getRMBEmployeeById(id);
        break;
      default:
        throw new BadRequestException('The provided user type is invali');
    }
    if (user) return user.notifications[user.notifications.length - 1];
  }

  async getNotificationsByUser(id: UUID, userType: string) {}
}
