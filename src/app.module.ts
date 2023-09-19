/* eslint-disable */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
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
import { AddressModule } from './address/address.module';
import { MinesiteModule } from './minesite/minesite.module';
import { HomeController } from './home/home.controller';
import { AuthController } from './auth/auth.controller';
import { MinesiteController } from './minesite/minesite.controller';
import { EmployeeController } from './miningCompanyEmployee/employee.controller';
import { EmployeeModule } from './miningCompanyEmployee/employee.module';
import { Notification } from './entities/notification.entity';
import { MineSite } from './entities/minesite.entity';
import { Incident } from './entities/incident.entity';
import { Address } from './entities/address.entity';
import { MineralModule } from './mineral/mineral.module';
import { CompanyModule } from './company/company.module';
import { JwtModule } from '@nestjs/jwt';
import { CompanyController } from './company/company.controller';
import { Mineral } from './entities/mineral.entity';
import { MineralService } from './mineral/mineral.service';
import { NotificationModule } from './notification/notification.module';
import { UserMiddleWare } from './middlewares/user.middleware';
import { RmbModule } from './rmb/rmb.module';
import { MiningCompany } from './entities/miningCompany.entity';
import { Organization } from './entities/organization.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { MiningCompanyEmployee } from './entities/miningCompany-employee.entity';
import { RMBEmployee } from './entities/rmb-employee';
import { MainUser } from './entities/MainUser.entity';
import { MailingService } from './mailing/mailing.service';
import { MiniIncident } from './entities/mini-incident.entity';

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
          MiningCompany,
          User,
          Role,
          Notification,
          MainUser,
          MineSite,
          Incident,
          Address,
          Mineral,
          Mineral,
          Organization,
          MiningCompanyEmployee,
          RMBEmployee,
          MiniIncident,
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
    JwtModule,
    MineralModule,
    NotificationModule,
    RmbModule,
    RmbModule,
    forwardRef(() => CompanyModule),
  ],
  controllers: [
    HomeController,
    AuthController,
    CompanyController,
    MinesiteController,
    EmployeeController,
  ],
  providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    private readonly roleService: RoleService,
    private readonly mineralService: MineralService,
    private readonly mailingService: MailingService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleWare).forRoutes('*');
  }
  async onModuleInit() {
    let roles = await this.roleService.getAllRoles();
    let minerals = await this.mineralService.getAllMinerals();

    await this.mailingService.sendEmail(
      'valensniyonsenga2003@gmail.com',
      'vava2003',
      '45454545',
      '4545',
      false,
    );
    if (!minerals || minerals.length == 0) {
      this.mineralService.createMinera();
    }
    if (!roles || roles.length == 0) {
      this.roleService.createRoles();
    }
  }
}
