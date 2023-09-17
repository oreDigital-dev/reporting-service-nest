/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { User } from 'src/entities/us.entity';
import { UUID } from 'crypto';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { RoleService } from 'src/roles/roles.service';
import { ERole } from 'src/enums/ERole.enum';
import { EAccountStatus } from 'src/enums/EAccountStatus.enum';
import { EGender } from 'src/enums/EGender.enum';
import { MailingService } from 'src/mailing/mailing.service';
import { UtilsService } from 'src/utils/utils.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeService } from 'src/miningCompanyEmployee/employee.service';
import { RmbService } from 'src/rmb/rmb.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) public userRepo: Repository<User>,

    private roleService: RoleService,
    private mailService: MailingService,

    private utilsService: UtilsService,

    private employeeService: EmployeeService,

    private rmbService : RmbService
  ) { }

  async createSytemAdmin(dto: CreateUserDto) {
    if (dto.registrationKey != 'admin@oreDigital')
      throw new BadRequestException(
        'You have provided invalid registration key',
      );
    const isUserAvailable = await this.userRepo.find({
      where: [
        {
          email: dto.email,
          phonenumber: dto.phoneNumber,
        },
      ],
    });
    if (isUserAvailable.length != 0) {
      throw new ForbiddenException(
        'The user with that email or phoneNumber already exist',
      );
    }
    let systemAdmin = new User(
      dto.firstName,
      dto.lastName,
      dto.email,
      EGender[dto.myGender],
      dto.national_id,
      dto.phoneNumber,
      dto.password,
      EAccountStatus.WAITING_EMAIL_VERIFICATION,
    );
    const adminRole = await this.roleService.getRoleByName(
      ERole[ERole.SYSTEM_ADMIN],
    );
    systemAdmin.password = await this.utilsService.hashString(
      systemAdmin.password,
    );
    systemAdmin.roles = [adminRole];
    systemAdmin.activationCode = this.generateRandomFourDigitNumber();
    let createdAdmin = await this.userRepo.save(systemAdmin);
    // this.mailService.sendEmailToUser(
    //   createdAdmin.email,
    //   'verify-account',
    //   'OreDigital account verification',
    // );
    delete createdAdmin.password;
    return {
      message:
        'we have a verification email to this admin to verify  the account',
      admin: createdAdmin,
    };
  }

  async getUsers() {
    const response = await this.userRepo.find({ relations: ['roles'] });
    return response;
  }

  async getUserByEmail(email: any) {
    let user : any;
    user = await this.employeeService.getEmployeeByEmail(email);  
    if(!user){
      user = await this.rmbService.getRMBEmployeeByEmail(email)
    }

 
    if (!user)
      throw new NotFoundException(
        'The user with the provided email is not found',
      );
    return user;
  }

  async getUserById(id: UUID, entity: String) {
    const response = await this.userRepo.findOne({
      where: {
        id: id,
      },
      relations: ['roles', 'company'],
    });
    if (!response) {
      throw new NotFoundException(`${entity} not found`);
    }
    return response;
  }

  generateRandomFourDigitNumber(): number {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
