import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { MineSite } from './minesite.entity';
import { UUID, randomUUID } from 'crypto';

@Entity('incidents')
export class Incident extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();

  @Column({ nullable: true, enum: EIncidentType})
  type: string;

  @Column({ nullable: false, default: EIncidentStatus[EIncidentStatus.FINE] })
  status: string;

  @Column({
    nullable: true,
    default: null,
  })
  measurement: number;

  @ManyToOne(() => MineSite)
  mineSite: MineSite;

  constructor(type: string, measurement: number) {
    super();
    this.type =type;
    this.measurement = measurement;
  }
}
