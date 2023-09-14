import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class CombinedIncidentDTO{
    @IsNumber()
    @IsNotEmpty()
    heatIndex: number;

    @IsNumber()
    @IsNotEmpty()
    temperature : number;

    @IsNumber()
    @IsNotEmpty()
    humidity: number;

    @IsUUID()
    @IsNotEmpty()
    origin: UUID;
    
    constructor(heatIndex: number, temperature: number, humidity: number , origin: UUID){
        this.heatIndex = heatIndex;
        this.temperature = temperature;
        this.humidity = humidity;
        this.origin = origin;
    }
}