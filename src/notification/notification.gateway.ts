import { Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SocketGateway {
  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}
  server: Server;

  @SubscribeMessage('all_notifications')
  async getAllNotifications() {
    this.server.sockets.emit(
      'allNotifications',
      await this.notificationService.getAllNotifications(),
    );
  }
}
