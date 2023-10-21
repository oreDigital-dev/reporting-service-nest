import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { Public } from 'src/decorators/public.decorator';
import { CreateConcessionDTO } from 'src/dtos/create-concession.dto';
import { ApiResponse } from 'src/payload/apiResponse';
import { ConcessionsService } from './concessions.service';
import { Request } from 'express';

@Controller('concessions')
@ApiTags('concessions')
export class ConcessionsController {
  constructor(private readonly concessionService: ConcessionsService) {}
  @Post('create')
  @Public()
  async create(dto: CreateConcessionDTO, @Req() req: Request) {
    return new ApiResponse(
      true,
      'The concession has been created successfully',
      await this.concessionService.create(dto, req),
    );
  }
  @Put('update/:id')
  @Public()
  async update(@Param('id') id: UUID, dto: CreateConcessionDTO) {
    return new ApiResponse(
      true,
      'The concession updated successfully',
      await this.concessionService.update(id, dto),
    );
  }
  @Get('all')
  @Public()
  async getAll() {
    return new ApiResponse(
      true,
      'All concessions retrieved successfully',
      await this.concessionService.getAll(),
    );
  }
  @Get('by-id')
  @Public()
  @ApiQuery({ name: 'id', required: true })
  async getById(@Query('id') id: UUID) {
    return new ApiResponse(
      true,
      'The concession retrieved successfully',
      await this.concessionService.getById(id),
    );
  }
  @Get('by-name')
  @Public()
  @ApiQuery({ name: 'name', required: true, type: String })
  async getByName(@Query('name') name: string) {
    return new ApiResponse(
      true,
      'The concession retrieved successfully',
      await this.concessionService.getByName(name),
    );
  }

  @Public()
  @Get('all/logged-in-company')
  async getMine(@Req() req: Request) {
    return new ApiResponse(
      true,
      'The concessions retrieved successfully',
      await this.concessionService.getMine(req),
    );
  }

  @Get('all')
  @Public()
  @ApiQuery({ name: 'companyId', required: true })
  async getAllByCompany(@Query('id') id: UUID) {
    return new ApiResponse(
      true,
      'All concessions retrieved successfully',
      await this.concessionService.getAllByCompany(id),
    );
  }
  @Delete('delete/:id')
  @Public()
  async deleteById(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'The concession was deleted successfuly',
      await this.concessionService.deleteById(id),
    );
  }
  @Delete('all/mine')
  @Public()
  async deleteAllMine(@Req() req: Request) {
    return new ApiResponse(
      true,
      'All you concessions deleted successfully',
      await this.concessionService.deleteAllMine(req),
    );
  }
}
