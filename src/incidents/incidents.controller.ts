import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { CombinedIncidentDTO } from 'src/dtos/combined-incidents.dto';
import { UUID } from 'crypto';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateMiniIncidentDTO } from 'src/dtos/create_mini-incident.dto';

@ApiTags('incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private incidentService: IncidentsService) {}

  @Post('/create')
  async createIncident(
    @Query('type') type: string,
    @Query('measurement') measurement: number,
    @Query('mineSiteId') mineSite: UUID,
  ) {
    const dto = new CreateIncidentDTO(type, measurement, mineSite);
    return new ApiResponse(
      true,
      'Incident created successfully!',
      await this.incidentService.saveIncident(dto),
    );
  }

  @Post('/min-incidents/create')
  CreateMinIncident(
    @Query('type') type: string,
    @Query('isHappened') isHappened: number,
    @Query('originMineSiteId') mineSiteId: UUID,
  ) {
    const dto = new CreateMiniIncidentDTO(type, isHappened, mineSiteId);
    return new ApiResponse(
      true,
      'Incident created successfully!',
      this.incidentService.saveMiniIncident(dto),
    );
  }

  @Get('/all')
  async getAllIncidents() {
    return new ApiResponse(
      true,
      'Retrieved successfully!',
      await this.incidentService.getAllIncidents(),
    );
  }

  
  @Get('/all/by-company')
  async getIncidentsByLoggedInCompany(
    @Req() request: Request,
    
  ) {
    return new ApiResponse(
      true,
      'Retrieved successfully!',
      await this.incidentService.getIncidentByLoggedInCompany(request),
    );
  }

  @Post('/create-combined')
  async createCombinedIncidents(
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
      await this.incidentService.saveCombinedIncidents(dto),
    );
  }

  @Get('/:id')
  async getIncidentById(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'Data retrieved successfully!',
      await this.incidentService.getIncidentById(id),
    );
  }
}
