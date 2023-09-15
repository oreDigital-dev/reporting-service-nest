import { ChildEntity } from 'typeorm';
import { Employee } from './employee.entity';

@ChildEntity('rescue_team_employees')
export class RescueTeamEmployee extends Employee {}
