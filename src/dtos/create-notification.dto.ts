import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class CreateNotificationDTO{
    @IsString()
    @IsNotEmpty()
    message : string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsUUID()
    to: UUID;
    
    constructor(message: string,  type: string){
        this.message = message;
        this.type = type;
    }
}