import { Controller, Get, Param, Req, Res, Query } from '@nestjs/common';
import { ApiResponse } from 'src/payload/apiResponse';
import { NotificationService } from './notification.service';
import { Request, Response } from 'express';
import { UUID } from 'crypto';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('all')
  @Roles('SYSTEM_ADMIN')
  async getAllNotifications() {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getAllNotifications(),
    );
  }
  @Get('all/loggedIn-user')
  @ApiQuery({ name: 'userType', required: true, type: String, example: 'rmb' })
  async getMyNotifications(
    @Query('userType') userType: string,
    @Req() req: Request,
  ) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getMyNotifications(req, userType),
    );
  }

  @Get('all/userId/:id/:userType')
  @ApiQuery({ name: 'id', required: true })
  @ApiQuery({ name: 'userType', required: true, type: String, example: 'rmb' })
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

  @Get('latest-one/loggedIn-employee')
  @ApiQuery({ name: 'userType', required: true, type: String, example: 'rmb' })
  async getMyLatestNotification(
    @Req() req: Request,
    @Query('userType') userType: string,
  ) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getMyLatestNotification(req, userType),
    );
  }

  @Get('latest-one/by-userId')
  @ApiQuery({ name: 'id', required: true })
  @ApiQuery({ name: 'userType', required: true, type: String, example: 'rmb' })
  async getLatestNotifictionByUserId(
    @Query('id') id: UUID,
    @Query('userType') userType: string,
  ) {
    return new ApiResponse(
      true,
      'Notifications retrieved successfully',
      await this.notificationService.getLatestNotifictionByUserId(id, userType),
    );
  }
}
