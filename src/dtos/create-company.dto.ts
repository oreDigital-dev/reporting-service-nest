import { EOwnershipType } from "src/enums/EOwnershipType.enum";

export class CreateCompanyDTO {
    name: string;
    ownership: EOwnershipType;
    email: string;
    ownerNID: string;
    password: string;
    phoneNumber: string;
    productionCapacity: string;
    mineralTypes: Array<String>;
    licenseNumber: number;
    numberOfEmployees: number;
}