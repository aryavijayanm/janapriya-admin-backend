import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 12;

// Every column except `password` -- reused by findAll/update so it's
// structurally hard to accidentally leak a password hash to the frontend.
const SAFE_SELECT = {
  id: true,
  name: true,
  username: true,
  designation: true,
  role: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: SAFE_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const { password, ...rest } = dto;
    const data: Prisma.UserUpdateInput = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: SAFE_SELECT,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw err;
    }
  }

  async create(createUserDto: CreateUserDto) {
    const { password, username, ...rest } = createUserDto;
    const normalizedUsername = username.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          ...rest,
          username: normalizedUsername,
          password: hashedPassword,
          is_active: true,
          last_login_at: null,
        },
        select: SAFE_SELECT,
      });

      return user;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Username already exists');
      }
      throw err;
    }
  }
}
