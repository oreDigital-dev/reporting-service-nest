import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/auth/auth.service';
import { CompanyService } from 'src/company/company.service';
import { Public } from 'src/decorators/public.decorator';
import { EmployeeService } from 'src/employees/employee.service';
import { MainUser } from 'src/entities/MainUser.entity';
import { MiningCompany } from 'src/entities/miningCompany.entity';
import { RescueTeam } from 'src/entities/rescue-team.entity';
import { EAccountType } from 'src/enums/EAccountType.enum';
import { ApiResponse } from 'src/payload/apiResponse';
import { RescueTeamsService } from 'src/rescue-teams/rescue-teams.service';
import { RmbService } from 'src/rmb/rmb.service';
import { UtilsService } from 'src/utils/utils.service';
import { Between } from 'typeorm';
import Express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { file } from '@babel/types';

@Controller('app')
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    private readonly employeesService: EmployeeService,
    private readonly rmbService: RmbService,
    private readonly rescueTeamService: RescueTeamsService,
    private readonly utilsService: UtilsService,
    private readonly companyService: CompanyService,
  ) {}

  @Get()
  @Public()
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

  @Get('reporting/employees/filter-by-status-date')
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: true,
    example: 'pending',
  })
  @ApiQuery({
    name: 'org',
    required: true,
    description: 'Organization in which an employee is located in',
    type: String,
    example: 'rmb',
  })
  async exportEmployeesFilteredByDateStatus(
    @Query('endDate') endDate: Date,
    @Query('startDate') startDate: Date,
    @Query('status') status: string,
    @Query('org') org: String,
    @Res() res: Response,
  ) {
    let employees: MainUser[];
    let validatedStatus = await this.utilsService.validateStatus(status);

    switch (org.toUpperCase()) {
      case EAccountType[EAccountType.COMPANY]:
        employees = await this.employeesService.employeeRepo.find({
          where: {
            createdAt: Between(startDate, endDate),
            employeeStatus: validatedStatus,
          },
          relations: ['company', 'address'],
        });
        break;
      case EAccountType[EAccountType.RESCUE_TEAM]:
        employees = await this.rescueTeamService.rescueTeamEmployeeRepo.find({
          where: {
            createdAt: Between(startDate, endDate),
            employeeStatus: validatedStatus,
          },
          relations: ['rescueTeam', 'address'],
        });
        break;
      case EAccountType[EAccountType.RMB]:
        employees = await this.rmbService.rmbRepo.find({
          where: {
            createdAt: Between(startDate, endDate),
            employeeStatus: validatedStatus,
          },
          relations: ['address'],
        });
        break;
      default:
        throw new BadRequestException('The provided organization is invalid');
    }

    const buffer = await this.utilsService.downloadEmployeesExcel(employees);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}_Employees.xlsx`,
    );
    res.send(buffer);
  }

  @Get('reporting/companies/filter-by-status-date')
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: true,
    example: 'pending',
  })
  async exportCompaniesFilteredByDateStatus(
    @Query('endDate') endDate: Date,
    @Query('startDate') startDate: Date,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    let companies: MiningCompany[];
    let validatedStatus = await this.utilsService.validateStatus(status);

    companies = await this.companyService.companyRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: validatedStatus,
      },
      relations: ['address'],
    });

    const buffer = await this.utilsService.downloadCompaniesExcel(companies);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}_Companies.xlsx`,
    );
    res.send(buffer);
  }

  @Get('reporting/rescue_teams/filter-by-status-date')
  @ApiQuery({
    name: 'startDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    type: Date,
    required: true,
    example: '2023-08-10T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'status',
    type: String,
    required: true,
    example: 'pending',
  })
  async exportRescueTeamsFilteredByDateStatus(
    @Query('endDate') endDate: Date,
    @Query('startDate') startDate: Date,
    @Query('status') status: string,
    @Res() res: Response,
  ) {
    let rescueTeams: RescueTeam[];
    let validatedStatus = await this.utilsService.validateStatus(status);

    rescueTeams = await this.rescueTeamService.rescueTeamRepo.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: validatedStatus,
      },
      relations: ['address'],
    });

    const buffer = await this.utilsService.downloadRescueTeamsExcel(
      rescueTeams,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${status}_Rescue_teams.xlsx`,
    );
    res.send(buffer);
  }

  @Post('importing/employees')
  @UseInterceptors(FileInterceptor('file'))
  @ApiQuery({ name: 'org', type: String, required: true, example: 'company' })
  async importEmplloyees(@UploadedFile() file) {
    this.utilsService.validateFile('excel', file);
  }

  @Post('importing/companies')
  async importCompanies(@Query('org') org: string) {}

  @Post('importing/rescue_teams')
  async importRescueTeams() {}
}
