import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateReportDTO } from 'src/dtos/create-report.dto';
import { UpdateReportDTO } from 'src/dtos/update-report.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('reports')
export class ReportsController {
  constructor(private reportService: ReportsService) {}
  @Post('create')
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
  @UseInterceptors(FileInterceptor('file'))
  async createReport(
    @Req() req: Request,
    @Body() dto: CreateReportDTO,
    @UploadedFile('file') file,
  ) {
    return new ApiResponse(
      true,
      'The report created successfully',
      await this.reportService.createReport(req, dto, file),
    );
  }

  @Put('update')
  @Roles('COMPANY_ADMIN', 'COMPANY_OWNER')
  @UseInterceptors(FileInterceptor('file'))
  async updateReport(
    @Req() req: Request,
    @Body() dto: UpdateReportDTO,
    @UploadedFile('file') file,
  ) {
    return new ApiResponse(
      true,
      'The report updated successfully',
      await this.reportService.updateReport(dto),
    );
  }

  @Get('all')
  async getAllMyReports(@Req() req: Request) {
    return new ApiResponse(
      true,
      'All reports retrieved successfully',
      await this.reportService.getAllMyReports(req),
    );
  }
  @Delete('delete/all-my-reports')
  async deleteAllMyReports(req: Request) {
    return new ApiResponse(
      true,
      'All reports deleted successfully',
      await this.reportService.deleteAllMyReports(req),
    );
  }
  @Delete('delete/my-report/:id')
  async deleteMyReport(@Param('id') id: UUID, @Req() req: Request) {
    return new ApiResponse(
      true,
      'The report deleted successfully',
      await this.reportService.deleteMyReport(id, req),
    );
  }
  @Get('/:id')
  async getReportById(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'Report retrieved successfully',
      await this.reportService.getReportById(id),
    );
  }
}
