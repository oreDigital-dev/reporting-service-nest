import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";
import { EIncidentStatus } from "src/enums/EIncidentStatus.enum";
import { EIncidentType } from "src/enums/EIncidentType.enum";

export class CreateIncidentDTO{

    @IsNotEmpty()
    type:string;


    @IsNotEmpty()
    measurement :  number;

    @IsNotEmpty()
    @IsUUID()
    mineSite :  UUID;

} 