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
  employedVictims: MainUser[];

  @Column({name : 'non_employed_victims', nullable: true})
  nonEmployedVictims : number;

  @Column({name : 'category', nullable: true})
  category: string;

  @Column({name : 'indicator', nullable: true})
  indicator: string;

  @Column({name : 'description', nullable: true})
  description: string;

  @Column({ name: 'bledding_level' })
  bleedingLevel: number;

  @Column({name : 'condition', nullable: true})
  condition: string;
<<<<<<< HEAD
=======

  @Column({name: 'action', nullable: true})
  action : string;


>>>>>>> a44637e4886f6fbc41978a041d886aa9c5574cb2
  document: string;

  @Column({
    name: 'visibility',
    default: EVisibilityStatus[EVisibilityStatus.VISIBLE],
  })
  visibility: string;

  constructor(
    category: string,
    indicator: string,
    date: Date,
    description: string,
    bleedingLevel: number,
    condition: string,
    action : string,
    nonEmployedVictims : number,
    document: string
  ) {
    super();
    this.date = date;
    this.category = category;
    this.indicator = indicator;
    this.description = description;
    this.bleedingLevel = bleedingLevel;
    this.condition = condition;
    this.action = action;
    this.nonEmployedVictims = nonEmployedVictims;
    this.document = document;
  }
}
