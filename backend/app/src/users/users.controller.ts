import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';  // SAME FOLDER
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // GO UP ONE
import { AdminGuard } from '../auth/admin.guard';       // GO UP ONE

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req) {
    return this.usersService.getById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('promote/:id')
  promote(@Param('id') id: string) {
    return this.usersService.promote(Number(id));
  }


  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
  return this.usersService.deleteUser(Number(id));
}

}
