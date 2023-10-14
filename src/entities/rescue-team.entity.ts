import { Column, Entity, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { RescueTeamEmployee } from './rescue_team-employee';

@Entity('rescue_team')
export class RescueTeam extends Organization {
  @Column({ name: 'rescue_team_category' })
  rescueTeamCategory: string;

  @OneToMany(
    () => RescueTeamEmployee,
    (rescueTeamEmployee) => rescueTeamEmployee.rescueTeam,
  )
  employees: RescueTeamEmployee[];
  constructor(
    name: string,
    email: string,
    phoneNumber: string,
    rescueTeamCategory: string,
  ) {
    super(name, email, phoneNumber);
    this.rescueTeamCategory = rescueTeamCategory;
  }
}
