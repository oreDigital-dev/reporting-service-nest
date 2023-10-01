import { Module, forwardRef } from '@nestjs/common';
import { RescueTeamsService } from './rescue-teams.service';
import { RescueTeamsController } from './rescue-teams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RescueTeam } from 'src/entities/rescue-team.entity';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { UtilsModule } from 'src/utils/utils.module';
import { RolesModule } from 'src/roles/roles.module';
import { AddressModule } from 'src/address/address.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RescueTeam, RescueTeamEmployee]),
    forwardRef(() => UtilsModule),
    RolesModule,
    AddressModule,
  ],
  providers: [RescueTeamsService],
  controllers: [RescueTeamsController],
  exports: [RescueTeamsService],
})
export class RescueTeamsModule {}
