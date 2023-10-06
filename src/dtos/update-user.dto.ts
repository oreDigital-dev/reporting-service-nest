/* eslint-disable */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

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
