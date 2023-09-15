/* eslint-disable */
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { ERole } from 'src/enums/ERole.enum';
import { Role } from 'src/entities/role.entity';
import { Employee } from 'src/entities/employee.enity';

@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) public roleRepo: Repository<Role>) {}
  createRoles() {
    const roleArray: Array<ERole> = [
      ERole.SYSTEM_ADMIN,
      ERole.RESCUE_TEAM_ADMIN,
      ERole.POLICE_STATION_ADMIN,
      ERole.POLICE_STATION_ADMIN,
      ERole.COMPANY_EMPLOYEE,
      ERole.COMPANY_OWNER,
    ];
    roleArray.forEach(async (role) => {
      const availableRole = await this.getRoleByName(role);
      if (!availableRole || availableRole == null) {
        const roleEntity = this.roleRepo.create({
          roleName: ERole[role],
        });
        this.roleRepo.save(roleEntity);
      }
    });
  }

  async assignRoleToEmployee(roleName: any, user: Employee) {
    const role: Role = await this.roleRepo.findOne({
      where: {
        roleName: roleName,
      },
    });
    user.roles.push(role);
    return user;
  }

  async getAllRoles() {
    return await this.roleRepo.find();
  }

  async getRoleByName(name: any) {
    return await this.roleRepo.findOne({
      where: {
        roleName: name,
      },
    });
  }

  async getRoleById(id: number) {
    const role = await this.roleRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}
