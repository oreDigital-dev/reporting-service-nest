import { InitiatorAudit } from 'src/audits/Initiator.audit';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Company } from './company.entity';
import { Incident } from './incident.entity';

@Entity('incidents')
export class MineSite extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  //   @Column({ default: 'GOLD' })
  //   minerals: Array<String>;

  @OneToOne(() => Address, (address) => address.mineSite)
  address: Address;

  @OneToMany(() => Incident, (incident) => incident.mineSite)
  incidents: Incident[];

  @ManyToOne(() => Company, (company) => company.mineSites)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
