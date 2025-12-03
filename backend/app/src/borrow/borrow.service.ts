import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BorrowService {
  constructor(private prisma: PrismaService) {}

  async borrowBook(userId: number, bookId: number) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });

    if (!book) throw new NotFoundException('Book not found');

    if (book.isBorrowed) {
      throw new BadRequestException('Book is already borrowed');
    }

    return this.prisma.book.update({
      where: { id: bookId },
      data: {
        isBorrowed: true,
        borrowedByUserId: userId,
      },
    });
  }

  async returnBook(userId: number, bookId: number) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });

    if (!book) throw new NotFoundException('Book not found');

    if (!book.isBorrowed) throw new BadRequestException('Book is not borrowed');

    if (book.borrowedByUserId !== userId) {
      throw new BadRequestException('You did not borrow this book');
    }

    return this.prisma.book.update({
      where: { id: bookId },
      data: {
        isBorrowed: false,
        borrowedByUserId: null,
      },
    });
  }

  async getBorrowedBooks(userId: number) {
    return this.prisma.book.findMany({
      where: { borrowedByUserId: userId },
      include: { author: true },
    });
  }
}
