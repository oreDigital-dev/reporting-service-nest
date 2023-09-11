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
import { RescueTeam } from './rescue_team.entity';
import { Company } from './company.entity';
import { Employee } from './employee.enity';

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

  @ManyToOne(() => RescueTeam, (rescueTeam) => rescueTeam.notifications)
  @JoinColumn({ name: 'rescue_team_id' })
  rescueTeam: RescueTeam;

  @JoinColumn({ name: 'company_id' })
  @ManyToOne(() => Company, (company) => company.notifications)
  company: Company;

  //   @JoinColumn({ name: 'company_id' })
  //   @ManyToOne(() => Employee, (employee) => employee.notifications)
  //   employee: Employee;
}
