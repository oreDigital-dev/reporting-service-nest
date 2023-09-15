import { ChildEntity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from './employee.enity';
import { MiningCompany } from './mining-company.entity';

@ChildEntity('mining_company_empoyees')
export class MiningCompanyEmployee extends Employee {
  @ManyToOne(() => MiningCompany, (company) => company.employees)
  @JoinColumn({ name: 'company_id' })
  miningCompany: MiningCompany;
}
