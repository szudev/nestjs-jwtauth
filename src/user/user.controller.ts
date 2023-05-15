import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/getAllUsers')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/getUserById/:id')
  getUserById() {
    return this.userService.getUserById();
  }

  @Get('/getCurrentUser')
  getCurrentUser() {
    return this.userService.getCurrentUser();
  }
}
