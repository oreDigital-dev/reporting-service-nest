import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MineSite } from './minesite.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { UUID } from 'crypto';
import { Organization } from './organization.entity';

@Entity('address')
export class Address extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column({ name: 'country', default: 'RWANDA' })
  country: string;

  @Column({ name: 'province' })
  province: string;

  @Column({ name: 'district' })
  district: string;

  @Column({ name: 'sector' })
  sector: string;

  @Column({ name: 'cell' })
  cell: string;

  @Column({ name: 'village' })
  village: string;

  @OneToMany(() => MineSite, (minesite) => minesite.address)
  mineSites: MineSite[];

  @OneToOne(() => Organization)
  @JoinColumn({ name: 'company' })
  company: Organization;

  constructor(
    province: string,
    district: string,
    sector: string,
    cell: string,
    village: string,
  ) {
    super();
    this.province = province;
    this.district = district;
    this.sector = sector;
    this.cell = cell;
    this.village = village;
  }
}
