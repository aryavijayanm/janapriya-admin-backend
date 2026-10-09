import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { paginate } from '../../common/pagination/paginate';

type StaffSortBy = 'name' | 'age' | 'rating';
type SortDir = 'asc' | 'desc';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  // Maps the public sort key to the actual Prisma orderBy -- kept separate
  // from the DTO so the one inversion below (age vs dob) lives in exactly
  // one place.
  private buildOrderBy(
    sortBy: StaffSortBy,
    sortDir: SortDir,
  ): Prisma.StaffOrderByWithRelationInput {
    if (sortBy === 'age') {
      // The most recently born person is the youngest (smallest age), so
      // "age ascending" is "dob descending" -- inverted once, here, so
      // nothing upstream (DTO, controller, frontend) needs to know about it.
      return { dob: sortDir === 'asc' ? 'desc' : 'asc' };
    }
    return { [sortBy]: sortDir };
  }

  findPaginated(
    page: number,
    sortBy: StaffSortBy = 'name',
    sortDir: SortDir = 'asc',
    serviceIds?: number[],
    search?: string,
  ) {
    const orderBy = this.buildOrderBy(sortBy, sortDir);
    // Soft-deleted staff stay in the table (so past duty/order history
    // keeps resolving their name) but never appear in a normal list.
    // When serviceIds is given, match staff who can perform ANY of the
    // selected services (not all) -- the standard semantics for a
    // multi-select filter checklist.
    const where: Prisma.StaffWhereInput = {
      status: { not: 'DELETED' },
      ...(serviceIds && serviceIds.length > 0
        ? { services: { some: { serviceId: { in: serviceIds } } } }
        : {}),
      // One search box, matched across whichever of these fields contains
      // it -- "near a place" or "by phone number" both just become an OR
      // across columns in the same WHERE, not a separate code path each.
      // Excludes rating, relationshipWithGuardian, idProof (by request),
      // and dob/status (not text columns -- `contains` doesn't apply to a
      // date or an enum without an extra cast).
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { place: { contains: search, mode: 'insensitive' } },
              { contactNumber: { contains: search, mode: 'insensitive' } },
              { guardianName: { contains: search, mode: 'insensitive' } },
              {
                guardianContactNumber: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              { verifiedAddress: { contains: search, mode: 'insensitive' } },
              { idNumber: { contains: search, mode: 'insensitive' } },
              { bankAccountDetails: { contains: search, mode: 'insensitive' } },
              { remarks: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    return paginate(
      // count and findMany must share the same `where` or totalPages would
      // be computed against a different set than what's actually returned.
      () => this.prisma.staff.count({ where }),
      (skip, take) =>
        this.prisma.staff.findMany({
          skip,
          take,
          where,
          orderBy,
          include: { services: { include: { service: true } } },
        }),
      page,
    );
  }

  async create(dto: CreateStaffDto) {
    const { serviceIds, dob, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      const staff = await tx.staff.create({
        data: {
          ...rest,
          dob: dob ? new Date(dob) : null,
        },
      });

      if (serviceIds && serviceIds.length > 0) {
        // A brand-new staff member can't already have any StaffService rows,
        // so a plain createMany is enough here (no need for the
        // upsert-per-row dance that editing an existing staff's list will
        // need later).
        await tx.staffService.createMany({
          data: serviceIds.map((serviceId) => ({
            staffId: staff.id,
            serviceId,
          })),
        });
      }

      return tx.staff.findUniqueOrThrow({
        where: { id: staff.id },
        include: { services: { include: { service: true } } },
      });
    });
  }

  // Deliberately not filtered by status -- someone following a direct link
  // (e.g. from an old duty record) should still be able to see a DISABLED
  // or DELETED staff member's details; it's only hidden from the *list*.
  async findOne(id: number) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: { services: { include: { service: true } } },
    });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return staff;
  }

  async update(id: number, dto: UpdateStaffDto) {
    const { serviceIds, dob, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      try {
        await tx.staff.update({
          where: { id },
          data: {
            ...rest,
            ...(dob !== undefined ? { dob: dob ? new Date(dob) : null } : {}),
          },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2025'
        ) {
          throw new NotFoundException('Staff not found');
        }
        throw err;
      }

      // Undefined means "don't touch the services list" (e.g. the
      // enable/disable toggle only sends { status }). When it IS sent,
      // sync the join table to exactly that set: add newly-checked
      // services, delete unchecked ones -- same upsert-by-presence design
      // as the rest of StaffService, just diffed against what's already there.
      if (serviceIds !== undefined) {
        const existing = await tx.staffService.findMany({
          where: { staffId: id },
          select: { serviceId: true },
        });
        const existingIds = existing.map((link) => link.serviceId);

        const toAdd = serviceIds.filter((sid) => !existingIds.includes(sid));
        const toRemove = existingIds.filter((sid) => !serviceIds.includes(sid));

        if (toAdd.length > 0) {
          await tx.staffService.createMany({
            data: toAdd.map((serviceId) => ({ staffId: id, serviceId })),
          });
        }
        if (toRemove.length > 0) {
          await tx.staffService.deleteMany({
            where: { staffId: id, serviceId: { in: toRemove } },
          });
        }
      }

      return tx.staff.findUniqueOrThrow({
        where: { id },
        include: { services: { include: { service: true } } },
      });
    });
  }
}
