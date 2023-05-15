import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { User_Role } from '@prisma/client';
import { CreateUserRoleDto } from './dto';
import { UserRoleService } from './user-role.service';

@Controller('userRole')
export class UserRoleController {
  constructor(private userRoleService: UserRoleService) {}

  @Post('/createUserRole')
  createUserRole(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateUserRoleDto,
  ): Promise<User_Role> {
    return this.userRoleService.createUserRole(dto);
  }

  @Get('/getAllUserRole')
  getAllUserRole() {
    return this.userRoleService.getAllUserRole();
  }

  @Get(':id')
  getUserRoleById() {
    return this.userRoleService.getUserRoleById();
  }

  @Patch(':id')
  updateUserRoleById() {
    return this.userRoleService.updateUserRoleById();
  }

  @Delete(':id')
  deleteUserRoleById() {
    return this.userRoleService.deleteUserRoleById();
  }
}
