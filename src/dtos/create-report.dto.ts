import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreateReportDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  mineSiteId: UUID;

  @IsNotEmpty()
  @ApiProperty()
  victimsIds: UUID[];

  @IsNotEmpty()
  @ApiProperty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  category: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  indicator: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  nonEmployedVictims : number;

  @IsNumber()
  @ApiProperty()
  bleedingLevel: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  condition: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  action: string;


}
