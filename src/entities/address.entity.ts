import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MineSite } from './minesite.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { UUID } from 'crypto';
import { Organization } from './organization.entity';
import { MiningCompany } from './mining-company.entity';
import { MiningCompanyEmployee } from './miningCompany-employee.entity';

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

  @OneToMany(() => MiningCompanyEmployee, (address) => address.address)
  miningCompanyEmployees: MiningCompanyEmployee[];

  @OneToMany(() => MiningCompany, (address) => address.address)
  @JoinColumn({ name: 'address_id' })
  company: MiningCompany[];

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
