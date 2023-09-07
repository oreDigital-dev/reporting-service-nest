import { ELocationType } from "src/enums/ELocationType";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Address")
export class Address {

    @PrimaryGeneratedColumn()
    id: number

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
    @JoinColumn({referencedColumnName: "parent_id"})
    parentId : Address;


}