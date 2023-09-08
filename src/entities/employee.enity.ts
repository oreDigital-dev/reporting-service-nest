import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Company } from './company.entity';
import { EEmployeStatus } from 'src/enums/EEmployeeStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { User } from './us.entity';

@Entity('employess')
export class Employee extends User {
  @Column()
  email: String;

  @ManyToMany(() => Company)
  @JoinTable()
  companies: Company[];

  @Column('numeric')
  salary: number;
  @Column({
    type: String,
    enum: EEmployeStatus,
    default: EEmployeStatus[EEmployeStatus.ACTIVE],
  })
  employeeStatus: EEmployeStatus;

  setCompanies(company: any) {
    this.companies.push(company);
  }
  getCompanies(): Company[] {
    return this.companies;
  }

  constructor(
    firstName: String,
    lastName: String,
    email: String,
    username: String,
    myGender: EGender,
    national_id: String,
    phonenumber: String,
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
    );
    this.salary = salary;
  }
}
