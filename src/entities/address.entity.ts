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
import { User } from './us.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Company } from './company.entity';
import { UUID } from 'crypto';
import { RescueTeam } from './rescue_team.entity';
import { Mineral } from './mineral.entity';

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

  @ManyToOne(() => RescueTeam, (rescue_team) => rescue_team.address)
  rescueTeams: RescueTeam;

  @OneToOne(() => Company)
  @JoinColumn({ name: 'company' })
  company: Company;

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
