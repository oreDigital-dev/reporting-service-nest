import { ELocationType } from 'src/enums/ELocationType';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { MineSite } from './minesite.entity';
import { User } from './us.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Company } from './company.entity';
import { UUID } from 'crypto';

@Entity('address')
export class Address extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID ;

  @Column({ name: 'country' })
  country: string;

  @Column({name : 'province'})
  province: string;

  @Column({ name: 'district' })
  district: string;

  @Column({ name: 'sector' })
  sector: string;

  @Column({ name: 'cell' })
  cell: string;
 
  @Column({ name: 'village' })
  village: string;

  @OneToOne(()=>MineSite)
  minesite : MineSite;

  @OneToOne(()=>Company)
  @JoinColumn({name : "company"})
  company : Company
}
