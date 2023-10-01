/* eslint-disable */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDTO } from 'src/dtos/login.dto';
import { User } from 'src/entities/us.entity';
import { VerifyAccountDTO } from 'src/dtos/verify-account.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { ResetPasswordDTO } from 'src/dtos/reset-password.dto';
import { AuthService } from './auth.service';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  public isUserAvailable: User;
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/login')
  async login(@Body() dto: LoginDTO): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'User logged in successfully!',
      await this.authService.login(dto),
    );
  }
  @Post('verify_account')
  async VerifyAccount(@Body() dto: VerifyAccountDTO): Promise<ApiResponse> {
    this.isUserAvailable = await this.userService.getUserByEmail(dto.email);
    if (this.isUserAvailable.activationCode != dto.verificationCode)
      throw new BadRequestException(
        'The provided verification code is invalid',
      );
    return new ApiResponse(
      true,
      'Your account is verified successfully',
      await this.authService.verifyAccount(dto.email, dto.userType),
    );
  }

  @Post('reset_password')
  async resetPassword(@Body() dto: ResetPasswordDTO): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'Your account was rest successfully ',
      await this.authService.resetPassword(
        dto.email,
        dto.activationCode,
        dto.newPassword,
      ),
    );
  }
  @Get('profile')
  async getProfile(@Req() req: Request, @Query('type') type: string) {
    let profile = await this.authService.getProfile(req, type);
    return new ApiResponse(true, 'Profile retrieved successfully', profile);
  }

  @Get('resend/{verification-code}/:email')
  async resendVerificationCode(
    @Param('email') email: string,
    userType: string,
  ) {
    return new ApiResponse(
      true,
      'The verification code was sent to your gmail account and phone number',
      await this.authService.resendVerificationCode(email, userType),
    );
  }
}
