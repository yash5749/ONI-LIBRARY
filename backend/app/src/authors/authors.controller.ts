import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAuthorDto } from './dto/create-author.dto';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('authors')
export class AuthorsController {
  constructor(private authorsService: AuthorsService) {}

  @Get()
  findAll() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard,AdminGuard)
  @Post()
  create(@Body() body: CreateAuthorDto) {
    return this.authorsService.create(body);
  }

  @UseGuards(JwtAuthGuard,AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: CreateAuthorDto) {
    return this.authorsService.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard,AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorsService.remove(Number(id));
  }
}
