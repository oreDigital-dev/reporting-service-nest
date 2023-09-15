import { Inject, forwardRef } from "@nestjs/common";
import { NotificationService } from "./notification.service";

export class SocketGateway{
    constructor(
        @Inject(forwardRef(()=> NotificationService))
        private readonly notificationService : NotificationService,
    ){}
}