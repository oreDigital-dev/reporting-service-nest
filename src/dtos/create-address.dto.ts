import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  country: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  province: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  district: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  sector: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cell: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  village: string;
}
