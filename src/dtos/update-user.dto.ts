/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { EGender } from 'src/enums/EGender.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  gender: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nationalId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @IsPhoneNumber()
  phonenumber: string;
}
