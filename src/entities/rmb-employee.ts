import { ChildEntity, OneToMany } from 'typeorm';
import { User } from './us.entity';
import { Employee } from './employee.enity';

@ChildEntity('rmb_employees')
export class RMBEmployee extends Employee {}
