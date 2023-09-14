import { ChildEntity } from 'typeorm';
import { Employee } from './employee.enity';

@ChildEntity('mining_company_empoyees')
export class MiningCompanyEmployee extends Employee {}
