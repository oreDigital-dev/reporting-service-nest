import { Body, Controller, Post } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDTO } from 'src/dtos/create-incident.dto';
import { ApiResponse } from 'src/payload/apiResponse';

@Controller('incidents')
export class IncidentsController {
    constructor(private incidentService : IncidentsService){}

    @Post('/create')
    createIncident(@Body() dto: CreateIncidentDTO){
        this.incidentService.saveIncident(dto);
        return new ApiResponse(true, 'Incident created successfully!', this.incidentService.saveIncident(dto))
    }

    

    
}
