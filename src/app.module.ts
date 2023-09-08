/* eslint-disable */
import { Module, OnModuleInit } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home/home.controller';
import { MailingModule } from './mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { RoleService } from './roles/roles.service';
import { File } from './file/File';
import { IncidentsModule } from './incidents/incidents.module';
import { CompanyModule } from './company/company.module';
import { AddressModule } from './address/address.module';
import { EmployeeModule } from './employee/employee.module';
import { CompanyController } from './company/company.controller';
import { MinesitesController } from './minesites/minesites.controller';
import { MineSite } from './entities/minesite.entity';
import { Company } from './entities/company.entity';
import { Employee } from './entities/employee.enity';
import { Notification } from './entities/notification.entity';
import { EmployeeController } from './employee/employee.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), // Import ConfigModule here
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Company, User, Role, Employee],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: process.cwd() + '/src/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    UsersModule,
    MailingModule,
    AuthModule,
    IncidentsModule,
    CompanyModule,
    AddressModule,
    EmployeeModule,
  ],
  controllers: [
    HomeController,
    AuthController,
    CompanyController,
    MinesitesController,
    EmployeeController,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly roleService: RoleService) {}

  async onModuleInit() {
    let roles = await this.roleService.getAllRoles();
    if (!roles || roles.length == 0) {
      this.roleService.createRoles();
    }
  }
}
