import { ChildEntity, Column, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { MineSite } from './minesite.entity';
import { EOwnershipType } from 'src/enums/EOwnershipType.enum';
import { Mineral } from './mineral.entity';
import { RescueTeamEmployee } from './rescue_team-employee';
import { MiningCompanyEmployee } from './mining_company-employee';

@ChildEntity('mining_companies')
export class MiningCompany extends Organization {
  @Column({
    name: 'owner_ship_type',
    default: EOwnershipType[EOwnershipType.PUBLIC],
  })
  ownershipType: String;
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

  @ManyToMany(() => MiningCompanyEmployee)
  @JoinTable()
  employees: MiningCompanyEmployee[];

  constructor(name: string, email: string, phoneNumber: string) {
    super(name, email, phoneNumber);
  }
}
