import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/payload/apiResponse';

@Controller()
@ApiTags('home')
export class HomeController {
  @Get()
  WelcomeHome() {
    return new ApiResponse(
      true,
      'Hello! welcome to oreDigital incident reporting backend api',
      null,
    );
  }
}
