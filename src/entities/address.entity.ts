import {
  Column,
  Entity,
  JoinColumn,
  JsonContains,
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

@Entity('address')
export class Address extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column({ name: 'country' })
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

  constructor(
    country: string,
    province: string,
    district: string,
    sector: string,
    cell: string,
    village: string,
  ) {
    super();
    this.country = country;
    this.province = province;
    this.district = district;
    this.sector = sector;
    this.cell = cell;
    this.village = village;
  }

  @OneToMany(() => MineSite, (mineSite) => mineSite.address)
  mineSites: MineSite;

  @OneToOne(() => Company)
  @JoinColumn({ name: 'company' })
  company: Company;

  @OneToMany(() => RescueTeam, (rescue_team) => rescue_team.address)
  rescueTeams: RescueTeam[];

  @OneToMany(() => User, (user) => user.address)
  users: User[];
}
