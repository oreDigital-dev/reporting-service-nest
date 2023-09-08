import { InitiatorAudit } from "src/audits/Initiator.audit";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { Incident } from "./incident.entity";
import { Company } from "./company.entity";
import { createMineSiteDTO } from "src/dtos/create-minesite.dto";
import {v4} from 'uuid';
import { Mineral } from "./minerals.entity";

@Entity('minesite')
export class MineSite extends InitiatorAudit{

    @PrimaryGeneratedColumn()
    id: string = v4();

    @Column()
    name : string;
    
    @ManyToMany(()=>Mineral)
    minerals: Mineral[];

    @JoinColumn({name: "address"})
    @OneToOne(()=> Address)
    address: Address;

    @OneToMany(()=> Incident, incident => incident.mineSite)
    incidents: Incident[]

    @ManyToOne(()=>Company)
    company : Company;

    
    constructor(name : string){
        super()
        this.name = name;
    }
    
}