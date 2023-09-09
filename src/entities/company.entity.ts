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
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Incident } from './incident.entity';
import { Mineral } from './minerals.entity';
import { UUID } from 'crypto';
import { Notification } from './notification.entity';

@Entity('company')
export class Company extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  name: String;

  @Column()
  ownerNID: string;

  @Column()
  email: String;

  @Column()
  password: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @ManyToOne(() => Address, (address) => address.company)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @Column()
  ownershipType: EOwnershipType;

  @Column()
  productionCapacity: string;

  @Column()
  numberOfEmployees: number;

  @Column()
  miniLicense: number;

  @ManyToMany(()=>Company)  
  minerals: Mineral[];

  @OneToMany(() => MineSite, (site) => site.company)
  mineSites: MineSite[];

    @OneToMany(() => Incident, (incident) => incident.mineSite)
    incidents: Incident[];

  @ManyToMany(() => Notification)
  notifications: Notification[];

  constructor( name : string,
    email : string,
    licenseNumber : number,
    productionCapacity : string,
    phoneNumber : string,
    ownerNID : string,
    numberOfEmployees : number,
    ownership: EOwnershipType) {
    super()
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
