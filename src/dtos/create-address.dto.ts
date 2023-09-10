import { IsString } from "class-validator";

export class CreateAddressDTO{
    @IsString()
    province : string;
    
    @IsString()
    district : string;

    @IsString()
    sector : string;

    @IsString()
    cell : string;

    @IsString()
    village : string;

}