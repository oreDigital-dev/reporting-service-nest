import { ENotificationStatus } from 'src/enums/ENotificationStatus.enum';
import { ENotificationType } from 'src/enums/ENotificationType.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './us.entity';
import { UUID } from 'crypto';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  type: ENotificationType;

  @Column()
  status: ENotificationStatus;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
