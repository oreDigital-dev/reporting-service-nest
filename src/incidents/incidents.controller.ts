import { Body, Controller, Get, Post } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { Request, Response } from 'express';

@Controller('incidents')
export class IncidentsController {
    constructor(private incidentService : IncidentsService){}

    @Post('/create')
    createIncident(@Body() dto: CreateIncidentDTO){
        return new ApiResponse(true, 'Incident created successfully!', this.incidentService.saveIncident(dto))
    }

    @Get('/all/by-company')
    getIncidentsByLoggedInCompany(request : Request , response: Response){
        return new ApiResponse(true, 'Retrieved successfully!', this.incidentService.getIncidentByLoggedInCompany(request, response))
    }
    
}
