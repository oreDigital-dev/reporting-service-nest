import { InitiatorAudit } from "src/audits/Initiator.audit";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import {v4} from 'uuid';

@Entity('mineral')
export class Mineral extends InitiatorAudit{

    @PrimaryGeneratedColumn()
    id: string = v4();

    @Column({name : "name"})
    name: string;

    @Column({name : "tagId"})
    tagId: number;

    @Column({name : "quantity"})
    quantity: number;

    @Column({name : "measurement"})
    measurement: string;

    constructor(name: string, tagId: number, quantity: number, measurement: string){
        super()
        this.name = name;
        this.tagId = tagId;
        this.quantity = quantity;
        this.measurement = measurement;
    }
}