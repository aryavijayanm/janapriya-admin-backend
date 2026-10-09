import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { StaffStatus } from '@prisma/client';
import { CreateStaffDto } from './create-staff.dto';

// Every CreateStaffDto field, but optional -- editing one field shouldn't
// require resending all the others. Plus `status`, which only makes sense
// on update (a brand-new staff member is always created ACTIVE).
export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;
}
