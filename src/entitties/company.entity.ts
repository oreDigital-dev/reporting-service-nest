import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { EOwnershipType } from "src/enums/EOwnershipType.enum";
import { MineSite } from "./minesite.entity";

@Entity({name: "entity"})
export class Company{

    @PrimaryGeneratedColumn()
    id: number;

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
    productionCapacity : number;

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



}