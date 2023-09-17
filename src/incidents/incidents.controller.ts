import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { CombinedIncidentDTO } from 'src/dtos/combined-incidents.dto';
import { UUID } from 'crypto';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private incidentService: IncidentsService) {}

  @Post('/create')
  createIncident(@Body() dto: CreateIncidentDTO) {
    return new ApiResponse(
      true,
      'Incident created successfully!',
      this.incidentService.saveIncident(dto),
    );
  }

  @Get('/all/by-company')
  getIncidentsByLoggedInCompany(request: Request, response: Response) {
    return new ApiResponse(
      true,
      'Retrieved successfully!',
      this.incidentService.getIncidentByLoggedInCompany(request, response),
    );
  }

  @Post('/create-combined')
  createCombinedIncidents(
    @Query('heatIndex') heatIndex: number,
    @Query('temperature') temperature: number,
    @Query('humidity') humidity: number,
    @Query('minesite') minesite: UUID,
  ) {
    let dto: CombinedIncidentDTO = new CombinedIncidentDTO(
      heatIndex,
      temperature,
      humidity,
      minesite,
    );
    return new ApiResponse(
      true,
      'Successfully saved!',
      this.incidentService.saveCombinedIncidents(dto),
    );
  }

  @Get('/by-id')
  getIncidentById(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'Data retrieved successfully!',
      this.getIncidentById(id),
    );
  }
}
