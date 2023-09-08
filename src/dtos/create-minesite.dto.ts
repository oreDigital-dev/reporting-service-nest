import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class createMineSiteDTO{

    @IsString()
    name : string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsArray()
    @IsNotEmpty()
    minerals: Array<String>;

    @IsString()
    @IsNotEmpty()
    companyId : string;

    @IsString()
    @IsNotEmpty()
    addressId: string;
}