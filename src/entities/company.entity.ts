import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { EOwnershipType } from "src/enums/EOwnershipType.enum";
import { MineSite } from "./minesite.entity";
import { CreateCompanyDTO } from "src/dtos/create-company.dto";
import {v4 } from 'uuid';

@Entity({name: "entity"})
export class Company{

    @PrimaryGeneratedColumn()
    id: string = v4();

    @Column()
    name: string;

    @Column()
    ownerNID : string;

    @Column()
    email : string;

    @Column()
    password : string;

    @Column({name: "phone_number"})
    phoneNumber : string;

    @Column({name: "location"})
    location: Address;

    @Column({default : "PRIVATE"})
    ownershipType :EOwnershipType;

    @Column()
    productionCapacity : string;

    @Column()
    numberOfEmployees: number;

    @Column()
    miniLicense : number;

    @Column()
    minerals: Array<String>;

    @Column()
    @OneToMany(()=>MineSite, site=> site.company)
    mineSites : MineSite[];

    @Column()
    @ManyToMany(()=>Notification)
    notifications: Notification[]

    constructor(dto: CreateCompanyDTO){
        this.name = dto.name;
        this.email = dto.email;
        this.miniLicense = dto.licenseNumber;
        this.productionCapacity = dto.productionCapacity;
        this.phoneNumber = dto.phoneNumber;
        this.ownerNID = dto.ownerNID;
        this.numberOfEmployees = dto.numberOfEmployees;
        this.ownershipType = dto.ownership;
        this.minerals  = dto.mineralTypes;
    }

}