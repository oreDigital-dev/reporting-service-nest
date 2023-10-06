import { IsNotEmpty } from 'class-validator';
import { UUID } from 'crypto';

export class CreateIncidentDTO {
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  measurement: number;

  @IsNotEmpty()
  mineSite: UUID;

  constructor(type: string, measurement: number, minesite: UUID) {
    (this.type = type),
      (this.measurement = measurement),
      (this.mineSite = minesite);
  }
}
