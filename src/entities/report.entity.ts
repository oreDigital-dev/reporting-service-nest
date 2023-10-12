import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { Entity } from 'typeorm';
@Entity('reports')
export class Report extends InitiatorAudit {}
