import { InitiatorAudit } from 'src/audits/Initiator.audit';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Mineral } from './mineral.entity';
import { UUID, randomUUID } from 'crypto';
import { MiningCompany } from './miningCompany.entity';

@Entity('minesite')
export class MineSite extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();

  @Column()
  name: string;

  @ManyToMany(() => Mineral, (mineral) => mineral.mineSites)
  @JoinTable()
  minerals: Mineral[];

  @ManyToOne(() => Address, (address) => address.mineSites)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  // @OneToMany(() => Incident, (incident) => incident.mineSite)
  // @Exclude()
  // incidents: Incident[];

  @ManyToOne(() => MiningCompany, (company) => company.mineSites)
  @JoinColumn({ name: 'company_id' })
  company: MiningCompany;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
