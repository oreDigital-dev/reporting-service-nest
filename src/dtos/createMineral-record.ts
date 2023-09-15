import { IsNotEmpty, IsString } from 'class-validator';
import { InitiatorAudit } from 'src/audits/Initiator.audit';
import { MineSite } from 'src/entities/minesite.entity';
import { JoinColumn, ManyToOne } from 'typeorm';

export class MineralRecord extends InitiatorAudit {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tagId: number;

  @IsString()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  measurement: string;

  @ManyToOne(() => MineSite, (mineSite) => mineSite.mineralRecords)
  @JoinColumn({ name: 'mine_site_id' })
  mineSite: MineSite;
}
