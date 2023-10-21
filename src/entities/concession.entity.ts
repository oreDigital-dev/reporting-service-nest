import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { MiningCompany } from './miningCompany.entity';
import { MineSite } from './minesite.entity';
import { Address } from './address.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UUID, randomUUID } from 'crypto';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';

@Entity('concessions')
export class Concession extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();
  @Column()
  name: string;

  @Column({ default: EVisibilityStatus[EVisibilityStatus.VISIBLE] })
  visibility: string;
  @ManyToOne(() => MiningCompany)
  @JoinColumn({ name: 'mining_company_id' })
  company: MiningCompany;
  @OneToMany(() => MineSite, (mineSite) => mineSite.concession)
  minesites: MineSite[];
  @ManyToOne(() => Address)
  address: Address;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
