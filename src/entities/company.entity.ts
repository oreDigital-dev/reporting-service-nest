import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { MineSite } from './minesite.entity';
import { Incident } from './incident.entity';
import { UUID } from 'crypto';
import { Notification } from './notification.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Mineral } from './mineral.entity';
import { User } from './us.entity';

@Entity('company')
export class Company extends InitiatorAudit {
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

  @ManyToMany(() => Mineral)
  @JoinTable()
  minerals: Mineral[];

  @OneToMany(() => MineSite, (site) => site.company)
  mineSites: MineSite[];

  @OneToMany(() => Incident, (incident) => incident.mineSite)
  incidents: Incident[];

  @ManyToMany(() => User)
  @JoinTable()
  employees: User[];

  @OneToMany(() => Notification, (notification) => notification.company)
  notifications: Notification[];

  constructor(
    name: string,
    email: string,
    licenseNumber: number,
    productionCapacity: number,
    phoneNumber: string,
    ownerNID: string,
    numberOfEmployees: number,
    ownership: string,
    password: string,
  ) {
    super();
    this.name = name;
    this.email = email;
    this.miniLicense = licenseNumber;
    this.productionCapacity = productionCapacity;
    this.phoneNumber = phoneNumber;
    this.ownerNID = ownerNID;
    this.numberOfEmployees = numberOfEmployees;
    this.ownershipType = ownership;
    this.password = password;
  }
}
