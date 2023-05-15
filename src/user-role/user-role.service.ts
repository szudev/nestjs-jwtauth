import { ForbiddenException, Injectable } from '@nestjs/common';
import { User_Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserRoleDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class UserRoleService {
  constructor(private prisma: PrismaService) {}

  async createUserRole(dto: CreateUserRoleDto): Promise<User_Role> {
    try {
      const newRole = await this.prisma.user_Role.create({
        data: {
          name: dto.rol,
        },
      });

      return newRole;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('The rol already exist.');
      }

      throw error;
    }
  }

  async getAllUserRole() {}

  async getUserRoleById() {}

  async updateUserRoleById() {}

  async deleteUserRoleById() {}
}
