import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UUID } from 'crypto';

export class CombinedIncidentDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  heatIndexValue: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  temperatureValue: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  humidityVaue: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  originMineSiteId: UUID;
}
