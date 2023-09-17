import { ENotificationStatus } from 'src/enums/ENotificationStatus.enum';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UUID } from 'crypto';
import { MiningCompany } from './miningCompany.entity';
import { MainUser } from './MainUser.entity';
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  type: ENotificationType;

  @Column({ default: ENotificationStatus['UNREAD'] })
  status: ENotificationStatus;

  @Column()
  message: string;

  @ManyToOne(() => MainUser, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: MainUser;

  @JoinColumn({ name: 'company_id' })
  @ManyToOne(() => MiningCompany, (company) => company.notifications)
  miningCompany: MiningCompany;

  constructor(message: string, type: ENotificationType) {
    this.message = message;
    this.type = type;
  }
}
