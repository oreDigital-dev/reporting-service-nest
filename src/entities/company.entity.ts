import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { MineSite } from './minesite.entity';
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { Employee } from './employee.enity';
import { Notification } from './notification.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { UUID } from 'crypto';

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

  // @ManyToOne(() => Address)
  // location: Address;

  @Column()
  ownershipType: EOwnershipType = EOwnershipType.PRIVATE;

  @Column()
  productionCapacity: number;

  @Column()
  numberOfEmployees: number;

  @Column()
  miniLicense: number;

  // @Column()
  // minerals: String[];

  // @Column()
  // @OneToMany(() => MineSite, (site) => site.company)
  // mineSites: MineSite[];

  // @ManyToMany(() => Notification)
  // notifications: Notification[];

  // @ManyToMany(() => Employee)
  // @JoinTable()
  // companies: Employee[];

  constructor(
    name: String,
    email: String,
    minLicense: number,
    productionCapacity: number,
    phoneNumber: string,
    ownershipId: string,
    numberOfEmployees: number,
    ownerShipType: EOwnershipType,
  ) {
    super();
    this.name = name;
    this.email = email;
    this.miniLicense = minLicense;
    this.productionCapacity = productionCapacity;
    this.phoneNumber = phoneNumber;
    this.ownerNID = ownershipId;
    this.numberOfEmployees = numberOfEmployees;
    this.ownershipType = ownerShipType;
  }
}
