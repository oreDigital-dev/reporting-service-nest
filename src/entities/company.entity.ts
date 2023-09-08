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
import { CreateCompanyDTO } from 'src/dtos/create-company.dto';
import { v4 } from 'uuid';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { InitiatorAudit } from 'src/audits/Initiator.audit';

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

  // @ManyToOne(() => Address, (address) => address.companies)
  // @JoinColumn({ name: 'address_id' })
  // address: Address;

  @Column({ default: 'PRIVATE' })
  ownershipType: EOwnershipType;

  @Column()
  productionCapacity: number;

  @Column()
  numberOfEmployees: number;

  @Column()
  miniLicense: number;

  // @Column()
  // minerals: String[];

  @OneToMany(() => MineSite, (site) => site.company)
  mineSites: MineSite[];

  //   @Column()
  //   @OneToMany(() => Incident, (incident) => incident.mineSite)
  //   incidents: Incident[];

  @Column()
  @ManyToMany(() => Notification)
  notifications: Notification[];

//   constructor(dto: CreateCompanyDTO) {
//     this.name = dto.name;
//     this.email = dto.email;
//     this.miniLicense = dto.licenseNumber;
//     this.productionCapacity = dto.productionCapacity;
//     this.phoneNumber = dto.phoneNumber;
//     this.ownerNID = dto.ownerNID;
//     this.numberOfEmployees = dto.numberOfEmployees;
//     this.ownershipType = dto.ownership;
//     this.minerals = dto.mineralTypes;
//   }
// }
