import { ENotificationStatus } from 'src/enums/ENotificationStatus.enum';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ENotificationType;

  @Column()
  status: ENotificationStatus;

  @Column()
  receiver: string;
}
