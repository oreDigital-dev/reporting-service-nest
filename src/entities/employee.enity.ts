import { ChildEntity, Column, ManyToOne } from 'typeorm';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { User } from './us.entity';
import { Company } from './company.entity';

@ChildEntity('employees')
export class Employee extends User {
  @Column('numeric')
  salary: number;
  
  @Column({
    enum: EEmployeStatus,
    default: EEmployeStatus.ACTIVE,
  })
  employeeStatus: EEmployeStatus;

  @ManyToOne(()=> Company)
  company: Company;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    myGender: EGender,
    national_id: string,
    phonenumber: string,
    salary: number,
    password: string,
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
    );
    this.password = password;
    this.salary = salary;
  }
}
