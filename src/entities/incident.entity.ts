import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MineSite } from './minesite.entity';

@Entity('incident')
export class Incident extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: String;

  @Column()
  type: EIncidentType;

  @Column()
  status: EIncidentStatus;

  @Column({
    nullable: true,
    default: null,
  })
  measurement: Number;

  @ManyToOne(() => MineSite, (mineSite) => mineSite.incidents)
  mineSite: MineSite;

  constructor(
    description: String,
    type: EIncidentType,
    status: EIncidentStatus,
    measurement: Number,
  ) {
    super();
    this.description = description;
    this.type = type;
    this.status = status;
    this.measurement = measurement;
  }
}
