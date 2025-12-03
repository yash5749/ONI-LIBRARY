import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(data: { title: string; isbn?: string; authorId: number }) {
    const author = await this.prisma.author.findUnique({
      where: { id: data.authorId },
    });

    if (!author) throw new BadRequestException('Invalid authorId');

    return this.prisma.book.create({ data });
  }

  findAll(query: any) {
    const { authorId, search, isBorrowed } = query;

    return this.prisma.book.findMany({
      where: {
        ...(authorId && { authorId: Number(authorId) }),
        ...(isBorrowed !== undefined && {
          isBorrowed: isBorrowed === 'true',
        }),
        ...(search && {
          title: { contains: search, mode: 'insensitive' },
        }),
      },
      include: { author: true, borrowedByUser: true },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { author: true, borrowedByUser: true },
    });

    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: number, data: any) {
    await this.findOne(id);

    if (data.authorId) {
      const author = await this.prisma.author.findUnique({
        where: { id: data.authorId },
      });
      if (!author) throw new BadRequestException('Invalid authorId');
    }

    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}
