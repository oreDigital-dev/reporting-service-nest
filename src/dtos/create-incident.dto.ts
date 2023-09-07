import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { EIncidentStatus } from "src/enums/EIncidentStatus.enum";
import { EIncidentType } from "src/enums/EIncidentType.enum";

export class CreateIncidentDTO{

    @IsNotEmpty()
    type:EIncidentType;


    @IsNotEmpty()
    measurement :  number;

    @IsNotEmpty()
    mineSite :  string;
} 