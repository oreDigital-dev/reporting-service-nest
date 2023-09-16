import { UUID } from 'crypto';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Notification } from './notification.entity';
import { EOrganizationStatus } from 'src/enums/EOrganizationStatus.enum';

@Entity('organizations')
export class Organization extends InitiatorAudit {

  @PrimaryColumn()
  id: UUID;
  
  @Column()
  name: string;
  @Column()
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({
    nullable: false,
    default: EOrganizationStatus[EOrganizationStatus.PENDING],
  })
  status: string;

  @ManyToOne(() => Address, (address) => address.company)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => Notification, (notification) => notification.miningCompany)
  notifications: Notification[];

  constructor(name: string, email: string, phoneNumber: string) {
    super();
    this.name = name;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}
