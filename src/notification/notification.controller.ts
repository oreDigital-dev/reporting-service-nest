import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiResponse } from 'src/payload/apiResponse';
import { NotificationService } from './notification.service';
import { Request, Response } from 'express';
import { UUID } from 'crypto';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('all')
  async getAllNotifications() {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getAllNotifications(),
    );
  }
  @Get('all/{loggedIn-user}')
  async getMyNotifications(req: Request, res: Response) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getMyNotifications(req, res),
    );
  }

  @Get('all/userId/:id/:userType')
  async getNotificationsByUserId(
    @Param('id') id: UUID,
    @Param('userType') userType: string,
  ) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getNotificationsByUserId(id, userType),
    );
  }

  @Get('latest-one/{loggedIn-employee}')
  async getMyLatestNotification(@Req() req: Request, @Res() res: Response) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getMyLatestNotification(req, res),
    );
  }

  @Get('latest-one/{by-userId}/:id')
  async getLatestNotifictionByUserId(
    @Param('id') id: UUID,
    @Param('userType') userType: string,
  ) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getLatestNotifictionByUserId(id, userType),
    );
  }
}
