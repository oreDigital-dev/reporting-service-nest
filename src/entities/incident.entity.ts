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
  type: EIncidentType;

  @Column()
  status: EIncidentStatus;

  @Column({
    nullable: true,
    default: null,
  })
  measurement: number;

  @ManyToOne(() => MineSite, (mineSite) => mineSite.incidents)
  mineSite: MineSite;

  constructor(type: EIncidentType, measurement: number) {
    super();
    this.type = type;
    this.measurement = measurement;
  }
}
