import { UUID } from 'crypto';

export class CreateMiniIncidentDTO {
  type: string;
  isHappened: number;
  originMineSite: UUID;

  constructor(type: string, isHappened: number, mineSiteId) {
    this.type = type;
    this.isHappened = isHappened;
    this.originMineSite = mineSiteId;
  }
}
