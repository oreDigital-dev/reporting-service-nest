import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Address } from "./address.entity";
import { ERescueTeamCategory } from "src/enums/ERescueTeamCategory.enum";

@Entity("rescue_team")
export class RescueTeam{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name : string;

    @Column()
    email : string;

    @Column()
    password : string;

    @Column()
    code: string;

    @Column()
    address : Address;

    @Column()
    category: ERescueTeamCategory;

    notifications: Notification[]
}