import { IsNotEmpty, IsString } from 'class-validator';
import { CreateOrganizationDTO } from './create-organization.dto';

export class CreateRescueDTO extends CreateOrganizationDTO {
  @IsNotEmpty()
  @IsString()
  rescueTeamCategory: string;
}
