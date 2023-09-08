import { InitiatorAudit } from "src/audits/Initiator.audit";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import {v4} from 'uuid';

@Entity('mineral')
export class Mineral extends InitiatorAudit{

    @PrimaryGeneratedColumn()
    id: string = v4();

    @Column({name : "name"})
    name: string;

    @Column({name : "description"})
    description: string;

    @Column({name : "mineral_code"})
    mineralCode: string;
}