import { ELocationType } from "src/enums/ELocationType";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {v4} from 'uuid'

@Entity("address")
export class Address {

    @PrimaryGeneratedColumn()
    id: string = v4()

    @Column({name: "location_type"})
    locationType : ELocationType;

    @Column()
    name : string;

    @Column({name: "name_french"})
    nameFrench : string;

    @Column({name :  "name_kiny"})
    nameKiny : string;

    residentialAddress : Address[]

    @ManyToOne(type => Address)
    @JoinColumn({name: "parent_id"})
    parentId : Address;


}