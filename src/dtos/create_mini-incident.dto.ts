import { UUID } from 'crypto';

export class CreateMiniIncidentDTO {
  type: string;
  isHappened: boolean;
  originMineSite: UUID;

  constructor(type: string, isHappened: boolean, mineSiteId) {
    this.type = type;
    this.isHappened = isHappened;
    this.originMineSite = mineSiteId;
  }
}
