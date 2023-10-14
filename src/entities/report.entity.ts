import { UUID, randomUUID } from 'crypto';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { MineSite } from './minesite.entity';
import { EVisibilityStatus } from 'src/enums/EVisibility.enum';
import { MiningCompanyEmployee } from './miningCompany-employee.entity';
import { MainUser } from './MainUser.entity';
@Entity('reports')
export class Report extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();

  @Column({ name: 'date', default: new Date(Date.now()) })
  date: Date;

  @ManyToOne(() => MineSite)
  @JoinColumn({ name: 'mine_site_id' })
  mineSite: MineSite;

  @ManyToOne(() => MiningCompanyEmployee, (user) => user.ownedReports)
  @JoinColumn({ name: 'owner_id' })
  owner: MainUser;

  @OneToMany(() => MiningCompanyEmployee, (employee) => employee.report)
  victims: MainUser[];

  category: string;
  indicator: string;

  description: string;
  @Column({ name: 'bledding_level' })
  bleedingLevel: number;
  condition: string;
  @Column({ name: 'first_information_source' })
  firstInformationSource: string;
  @Column({ name: 'seconda_information_source' })
  secondInformationSource: string;
  document: string;

  @Column({
    name: 'visibility',
    default: EVisibilityStatus[EVisibilityStatus.VISIBLE],
  })
  visibility: string;

  constructor(
    category: string,
    indicator: string,
    description: string,
    bleedingLevel: number,
    condition: string,
    firstInfoSource: string,
    secondInfoSource: string,
    document: string,
  ) {
    super();
    this.category = category;
    this.indicator = indicator;
    this.description = description;
    this.bleedingLevel = bleedingLevel;
    this.condition = condition;
    this.firstInformationSource = firstInfoSource;
    this.secondInformationSource = secondInfoSource;
    this.document = document;
  }
}
