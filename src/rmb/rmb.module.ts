import { Module, forwardRef } from '@nestjs/common';
import { RmbController } from './rmb.controller';
import { RmbService } from './rmb.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RMBEmployee } from 'src/entities/rmb-employee';
import { UtilsModule } from 'src/utils/utils.module';
import { RolesModule } from 'src/roles/roles.module';
import { MailingModule } from 'src/mailing/mailing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RMBEmployee]),
    forwardRef(() => UtilsModule),
    RolesModule,
    MailingModule,
  ],
  controllers: [RmbController],
  providers: [RmbService],
  exports: [RmbService],
})
export class RmbModule {}
