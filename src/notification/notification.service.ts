import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CompanyService } from 'src/company/company.service';
import { CreateNotificationDTO } from 'src/dtos/create-notification.dto';
import { Notification } from 'src/entities/notification.entity';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  activeUsers = {};
  constructor(
    @InjectRepository(Notification)
    public notificationRepo: Repository<Notification>,
    private companyService: CompanyService,
  ) {}
  async notify(type: string, dto: CreateNotificationDTO, id: UUID) {
    if (type == 'COMPANY') {
      let notifications = [];
      let notification = new Notification(
        dto.message,
        ENotificationType[dto.type],
      );
      let company = await this.companyService.getCompanyById(id);
      notification = await this.notificationRepo.save(notification);
      notifications.push(notification);
      company.notifications = notifications;
      notification.miningCompany = company;
      this.companyService.saveCompany(company);
    }
  }

  async sendNotification(data: CreateNotificationDTO) {
    let user;
    let newNotification;

    if (this.activeUsers[data.to]) {
    }
  }
}
