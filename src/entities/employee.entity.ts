import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './us.entity';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { MiningCompany } from './mining-company.entity';
import { ECompanyRole } from 'src/enums/ECompanyRole.enum';

@Entity('employees')
export class Employee extends User {
  @Column({default : 0})
  salary: number;

  @Column({
    enum: EEmployeStatus,
    default: EEmployeStatus.ACTIVE,
  })
  employeeStatus: EEmployeStatus;

  @ManyToOne(()=>MiningCompany)
  company: MiningCompany;

  @Column({default: ECompanyRole.EMPLOYEE})
  role :  ECompanyRole

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    password: string,
  ) {
    super(
      firstName,
      lastName,
      email,
      myGender,
      national_id,
      phonenumber,
      password,
      EAccountStatus.WAITING_EMAIL_VERIFICATION,
    );
    this.password = password;
  }
}
