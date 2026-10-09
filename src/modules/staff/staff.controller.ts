import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FindStaffDto } from './dto/find-staff.dto';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enums/role.enum';

// All three roles can register a staff member -- no @Roles() restriction,
// just needs to be logged in.
@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // OWNER + STAFF only -- layered on top of the class-level JwtAuthGuard via
  // a method-level guard, so POST above stays open to all three roles.
  // OUTSIDER access to this list will need a different query, specified later.
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.STAFF)
  findAll(@Query() query: FindStaffDto) {
    return this.staffService.findPaginated(
      query.page ?? 1,
      query.sortBy,
      query.sortDir,
      query.serviceIds,
      query.search,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  // Same guard as the list -- OUTSIDER gets neither the list nor a direct
  // link to work with.
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.STAFF)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER, Role.STAFF)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }
}
