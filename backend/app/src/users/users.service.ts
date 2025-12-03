import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  getById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async promote(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: { role: 'admin' },
    });
  }
}
