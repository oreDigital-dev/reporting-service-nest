import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { EOwnershipType } from "src/enums/EOwnershipType.enum";
import { MineSite } from "./minesite.entity";
import { CreateCompanyDTO } from "src/dtos/create-company.dto";
import {v4 } from 'uuid';
import { Notification } from "./notification.entity";
import { Mineral } from "./minerals.entity";

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

    @JoinColumn({name: "location"})
    @OneToOne(()=> Address)
    location: Address;

    @Column()
    ownershipType :EOwnershipType;

    @Column()
    productionCapacity : string;

    @Column()
    numberOfEmployees: number;

    @Column()
    miniLicense : number;

  
    @ManyToMany(()=>Mineral)
    minerals: Mineral[];


    @OneToMany(()=>MineSite, site=> site.company)
    mineSites : MineSite[];

    @ManyToMany(()=>Notification)
    notifications: Notification[]

    constructor(name: string, email:string , licenseNumber:number, productionCapacity: string, phoneNumber:string, ownerNID:string, numberOfEmployees:number, ownership:EOwnershipType){
        this.name = name;
        this.email = email;
        this.miniLicense = licenseNumber;
        this.productionCapacity = productionCapacity;
        this.phoneNumber = phoneNumber;
        this.ownerNID = ownerNID;
        this.numberOfEmployees = numberOfEmployees;
        this.ownershipType = ownership;
        // this.minerals  = dto.mineralTypes;
    }

}