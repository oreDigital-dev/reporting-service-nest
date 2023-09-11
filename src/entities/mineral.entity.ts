import { UUID } from "crypto";
import { InitiatorAudit } from "src/audits/Initiator.audit";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Company } from "./company.entity";

@Entity('mineral')
export class Mineral extends InitiatorAudit{

    @PrimaryGeneratedColumn()
    id: UUID;

    @Column({name : "name"})
    name: string;

    @Column({name : "tagId"})
    tagId: number;

    @Column({name : "quantity"})
    quantity: number;

    @Column({name : "measurement"})
    measurement: string;

    @ManyToMany(() => Company)
    companies: Company[];

    constructor(name: string, tagId: number, quantity: number, measurement: string){
        super()
        this.name = name;
        this.tagId = tagId;
        this.quantity = quantity;
        this.measurement = measurement;
    }
}