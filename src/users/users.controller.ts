import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create/system-admin')
  async createSytemAdmin(@Body() dto: CreateUserDto) {
    const response = await this.usersService.createSytemAdmin(dto);
    return new ApiResponse(true, response.message, response.admin);
  }
  @Get('all')
  @Roles('SYSTEM_ADMIN')
  getAllUsers() {
    return new ApiResponse(
      true,
      'Users retrieved successfully',
      this.usersService.getUsers(),
    );
  }
}
