import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/auth/auth.service';
import { ApiResponse } from 'src/payload/apiResponse';

@Controller('app')
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/get-profile')
  async getProfile(@Req() req: Request, @Query('type') type: string) {
    return new ApiResponse(
      true,
      'The profile retrieved successfully',
      await this.authService.getProfile(req, type),
    );
  }
}
