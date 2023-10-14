import { UUID } from 'crypto';
import { CreateReportDTO } from './create-report.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportDTO extends CreateReportDTO {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  reportId: UUID;
}
