import { InitiatorAudit } from "src/audits/Initiator.audit";
import { Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { Incident } from "./incident.entity";
import { Company } from "./company.entity";

export class MineSite extends InitiatorAudit{

    @PrimaryGeneratedColumn()
    id: number;

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

    

    
}