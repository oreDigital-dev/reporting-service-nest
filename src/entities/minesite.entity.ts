import { InitiatorAudit } from 'src/audits/Initiator.audit';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Company } from './company.entity';
import { Incident } from './incident.entity';
import { Mineral } from './minerals.entity';

@Entity('incidents')
export class MineSite extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Mineral, (mineral) => mineral.mineSites)
  @JoinTable()
  minerals: Mineral[];

  @ManyToOne(() => Address, (address) => address.mineSites)
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => Incident, (incident) => incident.mineSite)
  incidents: Incident[];

  @ManyToOne(() => Company, (company) => company.mineSites)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
