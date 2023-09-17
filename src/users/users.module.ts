import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/us.entity';
import { RolesModule } from 'src/roles/roles.module';
import { MailingModule } from 'src/mailing/mailing.module';
import { UtilsModule } from 'src/utils/utils.module';
import { EmployeeModule } from 'src/employee/employee.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    MailingModule,
    EmployeeModule,
    UtilsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
