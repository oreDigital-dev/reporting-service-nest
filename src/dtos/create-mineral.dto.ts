import { IsNotEmpty, IsString } from "class-validator";

export class CreateMineralDTO{

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    tagId: number;

    @IsString()
    @IsNotEmpty()
    quantity: number;

    @IsString()
    @IsNotEmpty()
    measurement: string;

}