import { IsArray } from "class-validator";
import { PageMetaDto } from "./page-meta.dts";

export class PageDto<T>{
     @IsArray()
     readonly data: T[];
     
     readonly meta: PageMetaDto;

     constructor(data: T[], meta: PageMetaDto){
          this.data = data;
          this.meta = meta;
     }
}