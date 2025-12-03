import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: { email: string; password: string; name?: string }) {
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        // role uses default "user"
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      message: 'User registered',
      user,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwt.sign(payload);

    const { password, ...safeUser } = user;

    return {
      message: 'Login successful',
      token,
      user: safeUser,
    };
  }
}
