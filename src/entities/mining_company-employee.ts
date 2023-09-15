import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MiningCompany } from './mining-company.entity';

@Entity('mining_company_employees')
export class MiningCompanyEmployee {
  @ManyToOne(() => MiningCompany)
  @JoinColumn({ name: 'mining_company_id' })
  company: MiningCompany;
}
