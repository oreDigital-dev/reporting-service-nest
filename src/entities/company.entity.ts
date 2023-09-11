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
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { MineSite } from './minesite.entity';
import { Incident } from './incident.entity';
import { Mineral } from './minerals.entity';
import { Notification } from './notification.entity';
import { v4 } from 'uuid';
import { UUID } from 'crypto';
import { EWorkSpaceStatus } from 'src/enums/EworkSpaceStatus.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { User } from './us.entity';
import { Employee } from './employee.enity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  name: string;

  @Column()
  ownerNID: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @ManyToOne(() => Address, (address) => address.company)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column({
    name: 'owner_ship_type',
    default: EOwnershipType[EOwnershipType.PUBLIC],
  })
  ownershipType: String;

  @Column({ nullable: true })
  productionCapacity: number;

  @Column()
  numberOfEmployees: number;

  @Column()
  miniLicense: number;

  @Column({
    name: 'workspace_status',
    default: EAccountStatus[EAccountStatus.WAITING_EMAIL_VERIFICATION],
  })
  workSpaceStatus: String;

  @ManyToMany(() => Company)
  minerals: Mineral[];

  @ManyToMany(() => User)
  users: User[];

  @OneToMany(() => MineSite, (site) => site.company)
  mineSites: MineSite[];

  @OneToMany(() => Incident, (incident) => incident.mineSite)
  incidents: Incident[];

  @OneToMany(() => Notification, (notification) => notification.company)
  notifications: Notification[];

  setUsers(user: User) {
    this.users.push(user);
  }

  constructor(
    name: string,
    email: string,
    licenseNumber: number,
    productionCapacity: number,
    phoneNumber: string,
    ownerNID: string,
    numberOfEmployees: number,
    ownership: String,
  ) {
    this.name = name;
    this.email = email;
    this.miniLicense = licenseNumber;
    this.productionCapacity = productionCapacity;
    this.phoneNumber = phoneNumber;
    this.ownerNID = ownerNID;
    this.numberOfEmployees = numberOfEmployees;
    this.ownershipType = ownership;
  }
}
