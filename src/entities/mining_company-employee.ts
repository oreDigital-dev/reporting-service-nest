import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MiningCompany } from './mining-company.entity';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { UUID, randomUUID } from 'crypto';

@Entity('mining_company_employees')
export class MiningCompanyEmployee extends InitiatorAudit {
  @PrimaryColumn()
  id: UUID = randomUUID();
  @ManyToOne(() => MiningCompany)
  @JoinColumn({ name: 'mining_company_id' })
  company: MiningCompany;
}
