import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { MainUser } from './MainUser.entity';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { LastMonthInstance } from 'twilio/lib/rest/api/v2010/account/usage/record/lastMonth';
import { RescueTeam } from './rescue-team.entity';

@Entity('rescue_team_employees')
export class RescueTeamEmployee extends MainUser {
  @ManyToOne(() => RescueTeam, (rescueTeam) => rescueTeam.employees)
  rescueTeam: RescueTeam;
  constructor(
    firstName: string,
    lastName: string,
    email: string,
    gender: string,
    national_id: string,
    password: string,
    phoneNumber: string,
    activationCode: number,
  ) {
    super(
      firstName,
      lastName,
      email,
      EGender[gender],
      phoneNumber,
      national_id,
      password,
      EAccountStatus.WAITING_EMAIL_VERIFICATION,
    );
    this.activationCode = activationCode;
  }
}
