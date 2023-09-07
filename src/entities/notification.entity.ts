import { ENotificationStatus } from "src/enums/ENotificationStatus.enum";
import { ENotificationType } from "src/enums/ENotificationType.enum";
import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Notification{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type : ENotificationType;

    @Column()
    status : ENotificationStatus;

    @Column()
    receiver: string;
}