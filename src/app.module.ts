/* eslint-disable */
import { Module, OnModuleInit } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailingModule } from './mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/us.entity';
import { Role } from './entities/role.entity';
import { RoleService } from './roles/roles.service';
import { IncidentsModule } from './incidents/incidents.module';
import { CompanyModule } from './company/company.module';
import { AddressModule } from './address/address.module';
import { MinesiteModule } from './minesite/minesite.module';
import { Company } from './entities/company.entity';
import { Employee } from './entities/employee.enity';
import { HomeController } from './home/home.controller';
import { AuthController } from './auth/auth.controller';
import { MinesiteController } from './minesite/minesite.controller';
import { CompanyController } from './company/company.controller';
import { EmployeeController } from './employee/employee.controller';
import { RescueteamsController } from './rescueteams/rescueteams.controller';
import { EmployeeModule } from './employee/employee.module';
import { Notification } from './entities/notification.entity';
import { MineSite } from './entities/minesite.entity';
import { Incident } from './entities/incident.entity';
import { Address } from './entities/address.entity';

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
        entities: [
          Company,
          User,
          Role,
          Employee,
          Notification,
          MineSite,
          Incident,
          Address,
        ],
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
    MinesiteModule,
    EmployeeModule,
  ],
  controllers: [
    HomeController,
    AuthController,
    CompanyController,
    MinesiteController,
    EmployeeController,
    RescueteamsController,
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
