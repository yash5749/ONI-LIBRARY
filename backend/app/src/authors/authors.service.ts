import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; bio?: string }) {
    return this.prisma.author.create({ data });
  }

  findAll() {
    return this.prisma.author.findMany({
      include: { books: true },
    });
  }

  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  async update(id: number, data: { name?: string; bio?: string }) {
    await this.findOne(id);
    return this.prisma.author.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.author.delete({ where: { id } });
  }
}
