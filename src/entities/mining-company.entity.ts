import { ChildEntity, Column, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { MineSite } from './minesite.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { Mineral } from './mineral.entity';
import { Employee } from './employee.entity';

@ChildEntity('mining_companies')
export class MiningCompany extends Organization {

  @Column({
    name: 'owner_ship_type',
    default: EOwnershipType.PUBLIC,
  })
  ownershipType: EOwnershipType;

  @Column({ nullable: false })
  productionCapacity: number;

  @Column({ default: 0 })
  numberOfEmployees: number;

  @Column()
  miniLicense: number;

  @OneToMany(() => MineSite, (site) => site.company)
  mineSites: MineSite[];

  @ManyToMany(() => Mineral)
  @JoinTable()
  minerals: Mineral[];

  @OneToMany(() => Employee, (emp)=> emp.company)
  @JoinTable()
  employees: Employee[];

  constructor(name: string, email: string, phoneNumber: string, numberOfEmployees: number, ownershipType: EOwnershipType ) {
    super(name, email, phoneNumber, );
    this.numberOfEmployees = numberOfEmployees;
    this.ownershipType = ownershipType;
  }

}
