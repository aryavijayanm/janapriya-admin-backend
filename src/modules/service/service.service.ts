import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  // What most consumers (customer/staff forms) want -- only the currently offered services.
  findAllActive() {
    return this.prisma.service.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
  }

  // The management page needs inactive ones too, so they can be reactivated.
  findAll() {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateServiceDto) {
    try {
      return await this.prisma.service.create({ data: dto });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `A service with this ${(err.meta?.target as string[])?.[0] ?? 'name'} already exists`,
        );
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdateServiceDto) {
    try {
      return await this.prisma.service.update({
        where: { id },
        data: dto,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException(
            `A service with this ${(err.meta?.target as string[])?.[0] ?? 'name'} already exists`,
          );
        }
        if (err.code === 'P2025') {
          throw new NotFoundException('Service not found');
        }
      }
      throw err;
    }
  }
}
