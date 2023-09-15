import { InitiatorAudit } from 'src/audits/Initiator.audit';
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
import { Incident } from './incident.entity';
import { Mineral } from './mineral.entity';
import { UUID } from 'crypto';
import { MiningCompany } from './mining-company.entity';
@Entity('incidents')
export class MineSite extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column()
  name: string;

  @ManyToMany(() => Mineral, (mineral) => mineral.mineSites)
  @JoinTable()
  minerals: Mineral[];

  @ManyToOne(() => Address, (address) => address.mineSites)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @ManyToMany(() => Mineral)
  mineral: Mineral[];

  @OneToMany(() => Incident, (incident) => incident.mineSite)
  incidents: Incident[];

  @ManyToMany(() => MiningCompany)
  @JoinColumn({ name: 'company_id' })
  company: MiningCompany;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
