import { ChildEntity, Column, JoinTable, ManyToMany } from 'typeorm';
import { ERescueTeamCategory } from 'src/enums/ERescueTeamCategory.enum';
import { Organization } from './organization.entity';
import { RescueTeamEmployee } from './rescue_team-employee';

@ChildEntity('rescue_teams')
export class RescueTeam extends Organization {
  @Column()
  code: string;

  @Column()
  category: ERescueTeamCategory;

  @ManyToMany(() => RescueTeamEmployee)
  @JoinTable()
  employees: RescueTeamEmployee[];
}
