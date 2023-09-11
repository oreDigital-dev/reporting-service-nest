import { IsNotEmpty, IsString } from 'class-validator';

export class MineralRecord {
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
