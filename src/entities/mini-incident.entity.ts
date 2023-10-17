import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { MineSite } from './minesite.entity';
import { UUID, randomUUID } from 'crypto';

@Entity('mini_incidents')
export class MiniIncident extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();

  @Column({ nullable: true })
  type: EIncidentType;

  @Column({ nullable: true })
  isHappened: boolean;

  @Column({ nullable: false, default: EIncidentStatus.FINE })
  status: EIncidentStatus;

  @ManyToOne(() => MineSite)
  mineSite: MineSite;

  constructor(type: EIncidentType, isHappened: boolean) {
    super();
    this.type = type;
  }
}
