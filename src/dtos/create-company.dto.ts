import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { EOwnershipType } from "src/enums/EOwnershipType.enum";

export class CreateCompanyDTO {

    @IsString()
    name: string;
    @IsNotEmpty()
    ownership: EOwnershipType;
    @IsString()
    email: string;
    @IsString()
    @IsNotEmpty()
    ownerNID: string;
    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    phoneNumber: string;
    
    productionCapacity: string;
    
    mineralTypes: Array<String>;

    @IsNumber()
    @IsNotEmpty()
    licenseNumber: number;

    @IsNumber()
    @IsNotEmpty()
    numberOfEmployees: number;

    @IsString()
    @IsNotEmpty()
    addressId: string;
}