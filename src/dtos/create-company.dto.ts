import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { CreateOrganizationDTO } from './create-organization.dto';

export class CreateCompanyDTO extends CreateOrganizationDTO {
  @IsNotEmpty()
  @ApiProperty()
  ownership: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  productionCapacity: number;

  @ApiProperty()
  @IsNotEmpty()
  minerals: UUID[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  licenseNumber: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  numberOfEmployees: number;
}
