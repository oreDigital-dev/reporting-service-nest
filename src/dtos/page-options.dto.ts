import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";
import { Order } from "src/enums/Order.enum";

export class PageOptionsDTO{

    readonly order? : string;

    @Type(()=> Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    readonly page? : number = 1;

    @Type(()=> Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    readonly take? : number = 10;

    // getSkip(): number{
    //     return (this.page -1) * this.take;
    // }
}