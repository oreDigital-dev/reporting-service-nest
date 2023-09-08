import { Global, Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailingModule } from 'src/mailing/mailing.module';
import { UtilsModule } from 'src/utils/utils.module';
import { RolesModule } from 'src/roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/us.entity';

@Global()
@Module({
  imports: [
    forwardRef(() => UtilsModule),
    MailingModule,
    RolesModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
