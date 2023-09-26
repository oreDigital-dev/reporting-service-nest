import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { AddressService } from 'src/address/address.service';
import { CreateRescueTeamDTO } from 'src/dtos/create_rescue-team.dto';
import { UpdateRescueTeamEmployee } from 'src/dtos/update_rescueteam-employee.dto';
import { UpdateRescueTeam } from 'src/dtos/update_rescueteam.dto';
import { RescueTeam } from 'src/entities/rescue-team.entity';
import { RescueTeamEmployee } from 'src/entities/rescue_team-employee';
import { EEmployeeType } from 'src/enums/EEmployeeType.enum';
import { ERole } from 'src/enums/ERole.enum';
import { RoleService } from 'src/roles/roles.service';
import { UtilsService } from 'src/utils/utils.service';
import { Repository } from 'typeorm';

@Injectable()
export class RescueTeamsService {
  constructor(
    @InjectRepository(RescueTeam) public rescueTeamRepo: Repository<RescueTeam>,
    @InjectRepository(RescueTeamEmployee)
    public rescueTeamEmployeeRepo: Repository<RescueTeamEmployee>,
    private configService: ConfigService,
    private utilsService: UtilsService,
    private roleService: RoleService,
    private addressService: AddressService,
  ) {}

  async createRescueTeam(dto: CreateRescueTeamDTO) {
    const isRescueTeamAvailable = await this.rescueTeamRepo.findOne({
      where: { email: dto.rescueTeam.email },
    });

    const isEmployeeAvailalbe = await this.rescueTeamEmployeeRepo.findOne({
      where: { email: dto.RescueTeamAdmin.email },
    });

    if (isRescueTeamAvailable)
      throw new ForbiddenException(
        'The rescue team is already registered! you can not create duplicates',
      );
    if (isEmployeeAvailalbe)
      throw new ForbiddenException(
        'The employee is already registered! you can not create duplicates',
      );

    let rescueTeamEmployee: any;
    let rescueTeam: any;
    let roles: any;
    let createdRescueTeamEmployee;
    switch (dto.RescueTeamAdmin.employeeType.toUpperCase()) {
      case EEmployeeType[EEmployeeType.ADMIN]:
        if (
          dto.RescueTeamAdmin.registrationKey !=
          this.configService.get('REGISTRATION_KEY')
        )
          throw new BadRequestException(
            'The provided registration key is invalid',
          );
        rescueTeamEmployee = new RescueTeamEmployee(
          dto.RescueTeamAdmin.firstName,
          dto.RescueTeamAdmin.lastName,
          dto.RescueTeamAdmin.email,
          this.utilsService.getGender(
            this.utilsService.getGender(dto.RescueTeamAdmin.myGender),
          ),
          dto.RescueTeamAdmin.national_id,
          dto.RescueTeamAdmin.password,
          dto.RescueTeamAdmin.phoneNumber,
        );

        rescueTeam = new RescueTeam(
          dto.rescueTeam.name,
          dto.rescueTeam.email,
          dto.rescueTeam.phoneNumber,
          this.utilsService.getRescueTeamCategory(
            dto.rescueTeam.rescueTeamCategory,
          ),
        );

        let employeess = rescueTeam.employees;
        createdRescueTeamEmployee = await this.rescueTeamEmployeeRepo.save(
          rescueTeamEmployee,
        );
        roles = await this.roleService.getRolesByNames([
          ERole[ERole.RESCUE_TEAM_ADMIN],
          ERole[ERole.RESCUE_TEAM_OWNER],
        ]);
        createdRescueTeamEmployee.roles = roles;
        createdRescueTeamEmployee.rescueTeam = rescueTeam;
        break;
      case EEmployeeType[EEmployeeType.EMPLOYEE]:
        rescueTeamEmployee = new RescueTeamEmployee(
          dto.RescueTeamAdmin.firstName,
          dto.RescueTeamAdmin.lastName,
          dto.RescueTeamAdmin.email,
          this.utilsService.getGender(
            this.utilsService.getGender(dto.RescueTeamAdmin.myGender),
          ),
          dto.RescueTeamAdmin.national_id,
          dto.RescueTeamAdmin.password,
          dto.RescueTeamAdmin.phoneNumber,
        );

        rescueTeam = new RescueTeam(
          dto.rescueTeam.name,
          dto.rescueTeam.email,
          dto.rescueTeam.phoneNumber,
          this.utilsService.getRescueTeamCategory(
            dto.rescueTeam.rescueTeamCategory,
          ),
        );

        createdRescueTeamEmployee = await this.rescueTeamEmployeeRepo.save(
          rescueTeamEmployee,
        );
        roles = await this.roleService.getRolesByNames([
          ERole[ERole.RESCUE_TEAM_EMPLOYEE],
        ]);

        createdRescueTeamEmployee.roles = roles;
        createdRescueTeamEmployee.rescueTeam = rescueTeam;
        createdRescueTeamEmployee.password = await this.utilsService.hashString(
          dto.RescueTeamAdmin.password,
        );
        break;
      default:
        throw new BadRequestException(
          'The provided employee category/type is invalid',
        );
    }
    const addresses = this.addressService.createAddresses([
      dto.RescueTeamAdmin.address,
      dto.rescueTeam.address,
    ]);
    rescueTeamEmployee.address = (await addresses).address1;
    rescueTeam.address = (await addresses).address2;
    await this.rescueTeamRepo.save(rescueTeam);
    return await this.rescueTeamEmployeeRepo.save(createdRescueTeamEmployee);
  }

  async UpdateEmployee(dto: Partial<UpdateRescueTeamEmployee>) {
    let availalbeEmployee = await this.getEmployeeById(dto.id);
    Object.assign(availalbeEmployee, dto);
    return await this.rescueTeamEmployeeRepo.save(availalbeEmployee);
  }

  async UpdateRescueTeam(dto: Partial<UpdateRescueTeam>) {
    let availalbleRescueTeam = await this.getRescueTeamById(dto.id);
    Object.assign(availalbleRescueTeam, dto);
    return await this.rescueTeamRepo.save(availalbleRescueTeam);
  }

  async getRescueTeamById(id: UUID) {
    const availableRescueTeam = await this.rescueTeamRepo.findOne({
      where: { id: id },
    });

    if (!availableRescueTeam)
      throw new BadRequestException(
        'The rescue team with the provided id is not found',
      );
    return availableRescueTeam;
  }

  async getEmployeeByEmail(email: string) {
    const employee = await this.rescueTeamEmployeeRepo.findOne({
      where: { email: email },
    });
    if (!employee)
      throw new NotFoundException(
        'The employee with the provided email is not found',
      );
    return employee;
  }

  async getRescueTeamByEmail(email: string) {
    let rescueTeam = await this.rescueTeamRepo.findOne({
      where: { email: email },
    });

    if (!rescueTeam)
      throw new NotFoundException(
        'The rescue team with the provided email is not found',
      );
    return rescueTeam;
  }

  async getEmployeeById(id: UUID) {
    const employee = await this.rescueTeamEmployeeRepo.findOne({
      where: { id: id },
    });
    if (!employee)
      throw new NotFoundException(
        'The employee with the provided id is not found',
      );
    return employee;
  }
  async getAllRescueTeamEmployees() {
    return await this.rescueTeamEmployeeRepo.find({});
  }

  async getAllRescueTeams() {
    return await this.rescueTeamRepo.find({});
  }

  async deleteRescueTeamEmployeeById(id: UUID) {
    const availableEmployee = await this.getEmployeeById(id);
    await this.rescueTeamEmployeeRepo.remove(availableEmployee);
  }

  async deleteAllEmployees() {
    const availableEmployees = await this.rescueTeamEmployeeRepo.find({});
    availableEmployees.forEach((emp) => {
      emp.roles.forEach(async (role) => {
        if (role.roleName != 'ADMIN')
          await this.rescueTeamEmployeeRepo.remove(emp);
      });
    });
  }
}
