import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { MinesiteService } from './minesite.service';
import { createMineSiteDTO } from 'src/dtos/create-minesite.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ApiResponse } from 'src/payload/apiResponse';
import { async } from 'rxjs';
import { UUID } from 'crypto';
import { UpdateMineSiteDTO } from 'src/dtos/update-minesite.dtp';
import { Roles } from 'src/utils/decorators/roles.decorator';

@ApiTags('minesites')
@Controller('minesites')
export class MinesiteController {
  constructor(private mineSiteService: MinesiteService) {}
  @Post('create')
  async createMineSite(
    @Body() body: createMineSiteDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const createdMineSite = await this.mineSiteService.createMineSite(
      body,
      req,
      res,
    );
    return new ApiResponse(
      true,
      'MineSite created successfully',
      createdMineSite,
    );
  }
  @Get('/all')
  async getAllMineSite() {
    return new ApiResponse(
      true,
      'mine sites retrieved successfully',
      await this.mineSiteService.getAllMineSite(),
    );
  }

  @Get('/for-loggedIn-company')
  getMinSitesOfLoggedCompany(@Req() req: Request, @Res() res: Response) {
    return new ApiResponse(
      true,
      'mine sites retrieved sucessfully',
      this.mineSiteService.getMinSitesOfLoggedCompany(req, res),
    );
  }

  @Delete('/:id')
  @Roles('COMPANY_OWNER')
  deleteMineSite(@Param('id') id: UUID) {
    return new ApiResponse(
      true,
      'Mine site deleted successfully',
      this.mineSiteService.deleteMineSite(id),
    );
  }

  @Delete('/delete-all/{loggedIn-company}')
  @Roles('COMPANY_OWNER')
  deleteAllMineSitesInMyCompany(@Req() req: Request, @Res() res: Response) {
    return new ApiResponse(
      true,
      'All your mine sites got deleted successfully',
      this.mineSiteService.deleteAllMineSitesInMyCompany(req, res),
    );
  }
  @Patch('update-one')
  @Roles('COMPANY_OWNER')
  async UpdateMineSite(@Body() dto: UpdateMineSiteDTO) {
    return new ApiResponse(
      true,
      'Mine site updated sucessfully',
      await this.mineSiteService.UpdateMineSite(dto),
    );
  }
}
