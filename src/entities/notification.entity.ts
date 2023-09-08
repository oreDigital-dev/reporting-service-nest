import { InitiatorAudit } from "src/audits/Initiator.audit";
import { ENotificationStatus } from "src/enums/ENotificationStatus.enum";
import { ENotificationType } from "src/enums/ENotificationType.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('notification')
export class Notification extends InitiatorAudit{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type : ENotificationType;

    @Column()
    status : ENotificationStatus;

    @Column()
    receiver: string;
}