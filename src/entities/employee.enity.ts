import { Column, Entity, ManyToOne } from 'typeorm';
import { Company } from './company.entity';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { User } from './us.entity';

@Entity('employess')
export class Employee extends User{

  @ManyToOne(() => Company)
  company: Company;

  @Column('numeric')
  salary: number;
  @Column({
    enum: EEmployeStatus,
    default: EEmployeStatus.ACTIVE,
  })
  employeeStatus: EEmployeStatus;

  // setCompanies(company: any) {
  //   this.companies.push(company);
  // }
  // getCompanies(): Company[] {
  //   return this.companies;
  // }

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    salary: number,
  ) {
    super(
      firstName,
      lastName,
      email,
      username,
      myGender,
      national_id,
      phonenumber,
      '',
      EAccountStatus.ACTIVE,
    )
    this.salary = salary;
  }
}
