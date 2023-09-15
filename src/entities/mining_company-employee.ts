import { ChildEntity } from 'typeorm';
import { Employee } from './employee.entity';

@ChildEntity('mining_company_employees')
export class MiningCompanyEmployee extends Employee {}
