import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateBookDto } from '../authors/dto/create-book.dto';
import { UpdateBookDto } from '../authors/dto/update-book.dto';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  create(@Body() body: CreateBookDto) {
    return this.booksService.create(body);
  }

  @UseGuards(JwtAuthGuard,AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBookDto) {
    return this.booksService.update(Number(id), body);
  }

  @UseGuards(JwtAuthGuard,AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(Number(id));
  }
}
