import { IsNotEmpty, IsString } from "class-validator";

export class CreateNotificationDTO{
    @IsString()
    @IsNotEmpty()
    message : string;

    @IsString()
    @IsNotEmpty()
    type: string;
    
    constructor(message: string,  type: string){
        this.message = message;
        this.type = type;
    }
}