import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { ApproveOrRejectEmployeeDTO } from 'src/dtos/reject_or_approve-user.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create/system-admin')
  @Public()
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
