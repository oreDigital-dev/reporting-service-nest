import { Body, Controller, Delete, Get, Param, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEmployeeDTO } from 'src/dtos/create-employee.dto';
import { UpdateEmployeeDTO } from 'src/dtos/update-employee.dto';
import { EmployeeService } from './employee.service';
import { Request, Response } from 'express';
import { ApiResponse } from 'src/payload/apiResponse';
import { UUID } from 'crypto';

@Controller('employees')
@ApiTags('company-employees')
export class EmployeeController {
  constructor(private empService: EmployeeService) {}
  @Get('/create')
  async createEmployee(
    @Body() dto: CreateEmployeeDTO,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'The emnployee created successfully',
      await this.empService.createEmployee(dto, req, res),
    );
  }
  @Get('/update')
  async updateEmployee(@Body() dto: UpdateEmployeeDTO): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'The employee updated sucessfully',
      await this.empService.updateEmployee(dto),
    );
  }
  @Get('/one/:email')
  async getEmployeeByEmail(
    @Param('email') email: String,
  ): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'The employee retrived successfully',
      await this.empService.getEmployeeByEmail(email),
    );
  }
  @Get('/one/:id')
  async getEmployeeById(id: UUID): Promise<ApiResponse> {
    return new ApiResponse(
      true,
      'The employee retieved successfully',
      await this.empService.getEmployeeById(id),
    );
  }

  @Get('/all/by-loggedin-company')
  async getEmployeesByLoggedInCompany(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return new ApiResponse(
      true,
      'All employees retrieved sucessfully',
      await this.empService.getEmployeesByLoggedInCompany(req, res),
    );
  }

  @Get('/all')
  async getAllEmployees() {
    return new ApiResponse(
      true,
      'All employees retrieved sucessfully',
      await this.empService.getAllEmployees(),
    );
  }

  @Delete('/all')
  async deleteAllEmployees() {
    await this.empService.deleteAllEmployees();
    return new ApiResponse(true, 'All employees deleted sucessfully', null);
  }

  @Delete('/:id')
  async deleteEmployeeById(@Param('id') id: UUID): Promise<ApiResponse> {
    await this.empService.deleteEmployeeById(id);
    return new ApiResponse(true, 'The employee deleted successfully', null);
  }
}
