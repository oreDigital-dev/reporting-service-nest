import { InitiatorAudit } from "src/audits/Initiator.audit";
import { Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { Incident } from "./incident.entity";
import { Company } from "./company.entity";
import { createMineSiteDTO } from "src/dtos/create-minesite.dto";
import {v4} from 'uuid';
export class MineSite extends InitiatorAudit{

    @PrimaryGeneratedColumn()
    id: string = v4();

    @Column()
    name : string;
    
    @Column({default:"GOLD"})
    minerals: Array<String>;

    @Column()
    address: Address;

    @Column()
    @OneToMany(()=> Incident, incident => incident.mineSite)
    incidents: Incident[]

    @Column()
    @ManyToOne(()=>Company)
    company : Company;

    
    constructor(dto: createMineSiteDTO){
        super()
        this.name = dto.name;
        this.minerals = this.minerals
    }
    
}