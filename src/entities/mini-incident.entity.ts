import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { EIncidentStatus } from 'src/enums/EIncidentStatus.enum';
import { EIncidentType } from 'src/enums/EIncidentType.enum';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MineSite } from './minesite.entity';
import { UUID } from 'crypto';

@Entity('mini_incidents')
export class MiniIncident extends InitiatorAudit {
  @PrimaryGeneratedColumn()
  id: UUID;

  @Column({ nullable: true })
  type: EIncidentType;

  @Column({ nullable: false, default: EIncidentStatus.FINE })
  status: EIncidentStatus;

  @ManyToOne(() => MineSite)
  mineSite: MineSite;

  constructor(type: EIncidentType, isHappened: boolean) {
    super();
    this.type = type;
  }
}
