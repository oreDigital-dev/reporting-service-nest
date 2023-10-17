import { ENotificationStatus } from 'src/enums/ENotificationStatus.enum';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UUID, randomUUID } from 'crypto';
import { MiningCompany } from './miningCompany.entity';
import { MainUser } from './MainUser.entity';
@Entity('notifications')
export class Notification {
  @PrimaryColumn()
  id: UUID = randomUUID();

  @Column({ nullable: true })
  type: ENotificationType;

  @Column({ default: ENotificationStatus['UNREAD'] })
  status: ENotificationStatus;

  @Column()
  message: string;

  @ManyToOne(() => MainUser, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: MainUser;

  @ManyToOne(() => MiningCompany, (company) => company.notifications)
  @JoinColumn({ name: 'company_id' })
  miningCompany: MiningCompany;

  constructor(message: string, type: ENotificationType) {
    this.message = message;
    this.type = type;
  }
}
