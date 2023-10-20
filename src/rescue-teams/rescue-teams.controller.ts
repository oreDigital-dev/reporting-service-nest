import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { RescueTeamsService } from './rescue-teams.service';
import { CreateRescueTeamDTO } from 'src/dtos/create_rescue-team.dto';
import { UpdateRescueTeamEmployee } from 'src/dtos/update_rescueteam-employee.dto';
import { UUID } from 'crypto';
import { ApiResponse } from 'src/payload/apiResponse';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateRescueTeam } from 'src/dtos/update_rescueteam.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Request } from 'express';
import { Public } from 'src/decorators/public.decorator';

@Controller('rescue-teams')
@ApiTags('rescue_teams')
export class RescueTeamsController {
  constructor(private rescueTeamService: RescueTeamsService) {}

  @Post('create')
  @Public()
  async createRescueTeam(@Body() dto: CreateRescueTeamDTO) {
    return new ApiResponse(
      true,
      'The rescue team created successfully',
      await this.rescueTeamService.createRescueTeam(dto),
    );
  }
  @Put('/employees/update/:id')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async UpdateEmployee(@Body() dto: UpdateRescueTeamEmployee) {
    return new ApiResponse(
      true,
      'The employee updated successfully',
      await this.rescueTeamService.UpdateEmployee(dto),
    );
  }
  @Put('update/:id')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async UpdateRescueTeam(@Body() dto: UpdateRescueTeam) {
    return new ApiResponse(
      true,
      'The rescue team updated succecssfully',
      await this.rescueTeamService.UpdateRescueTeam(dto),
    );
  }
  @Get('employees')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  @ApiQuery({
    name: 'email',
    type: String,
    required: true,
    example: 'info@oredigital.rw',
  })
  async getEmployeeByEmail(@Query('email') email: string) {
    return new ApiResponse(
      true,
      'The employee has retrieved successfully',
      await this.rescueTeamService.getEmployeeByEmail(email),
    );
  }

  @Get('employees/loggedIn-rescue-team')
  async getEmployeesOfLoginRescueTeam(@Req() req: Request) {
    return new ApiResponse(
      true,
      'All employees retrieved successfully',
      await this.rescueTeamService.getEmployeesOfLoginRescueTeam(req),
    );
  }
  @Get()
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  @ApiQuery({
    name: 'email',
    type: String,
    required: true,
    example: 'info@oredigital.rw',
  })
  async getRescueTeamByEmail(@Query('email') email: string) {
    return new ApiResponse(
      true,
      'The rescue team has retrieved successfully',
      await this.rescueTeamService.getRescueTeamByEmail(email),
    );
  }
  @Get('employees')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  @ApiQuery({ name: 'id', required: true })
  async getEmployeeById(@Query('id') id: UUID) {
    return new ApiResponse(
      true,
      'An employee retrieved successfully',
      await this.rescueTeamService.getEmployeeById(id),
    );
  }
  @Get('employees')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async getAllRescueTeamEmployees() {
    return new ApiResponse(
      true,
      'Employees retrieved successfully',
      await this.rescueTeamService.getAllRescueTeamEmployees(),
    );
  }
  @Get('all')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async getAllRescueTeams() {
    return new ApiResponse(
      true,
      'rescue teams retrieved successfully',
      await this.rescueTeamService.getAllRescueTeams(),
    );
  }

  @Put('/approve-or-reject')
  @Roles('RMB_ADMIN', 'SYSTEM_ADMIN')
  @ApiQuery({
    name: 'action',
    type: String,
    required: true,
    example: 'approve',
  })
  @ApiQuery({ name: 'id', required: true })
  async approveOrRejectRescueTeams(
    @Query('action') action: string,
    @Query('id') id: UUID,
  ) {
    return new ApiResponse(
      true,
      'The rescue team updated successsfully',
      await this.rescueTeamService.approveOrRejectRescueTeams(action, id),
    );
  }

  @Put('/employees/approve-or-reject')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  @ApiQuery({
    name: 'action',
    type: String,
    required: true,
    example: 'approve',
  })
  @ApiQuery({ name: 'id', required: true })
  async approveOrRejectRescueTeamEmployees(
    @Query('action') action: string,
    @Query('id') id: UUID,
  ) {
    return new ApiResponse(
      true,
      'The rescue team employee have approved successfully',
      await this.rescueTeamService.approveOrRejectRescueTeamEmployees(
        id,
        action,
      ),
    );
  }
  @Get('all/by-status')
  @ApiQuery({
    name: 'status',
    required: true,
    type: String,
    example: 'pending',
  })
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async getRescueTeamsByStatus(@Query('status') status: string) {
    return new ApiResponse(
      true,
      'The rescue teams retrieved successfully',
      await this.rescueTeamService.getRescueTeamsByStatus(status),
    );
  }

  @Delete('employees/:id')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async deleteRescueTeamEmployeeById(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      ' An employee deleted successfully',
      await this.rescueTeamService.deleteRescueTeamEmployeeById(id),
    );
  }

  @Delete('all')
  @Roles('RESCUE_TEAM_ADMIN', 'RESCUE_TEAM_OWNER')
  async deleteAllEmployees() {
    return new ApiResponse(
      true,
      ' All employees deleted successfully',
      await this.rescueTeamService.deleteAllEmployees(),
    );
  }
}
