import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { Notification } from './notification.entity';

@Entity('rescue_team')
export class RescueTeam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  code: string;

  @ManyToOne(() => Address, (address) => address.rescueTeams)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column()
  category: ERescueTeamCategory;

  @OneToMany(() => Notification, (notification) => notification.rescueTeam)
  notifications: Notification[];
}
