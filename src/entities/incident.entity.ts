import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MineSite } from './minesite.entity';

@Entity('incident')
export class Incident extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  status: EIncidentStatus;

  @Column({
    nullable: true,
    default: null,
  })
  measurement: Number;

  @ManyToOne(() => MineSite, (mineSite) => mineSite.incidents)
  mineSite: MineSite;

  constructor(type: string, measurement: Number) {
    super();
    this.type = type;
    this.measurement = measurement;
  }
}
