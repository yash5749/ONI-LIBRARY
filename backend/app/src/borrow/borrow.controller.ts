import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@UseGuards(JwtAuthGuard)
@Controller('borrow')
export class BorrowController {
  constructor(private borrowService: BorrowService) {}

  @Post()
  borrow(@Request() req, @Body() body: { bookId: number }) {
    return this.borrowService.borrowBook(req.user.userId, body.bookId);
  }

  @Post('return')
  returnBook(@Request() req, @Body() body: { bookId: number }) {
    return this.borrowService.returnBook(req.user.userId, body.bookId);
  }

  @Get('user/me')
  getMyBorrowed(@Request() req) {
    return this.borrowService.getBorrowedBooks(req.user.userId);
  }
}
