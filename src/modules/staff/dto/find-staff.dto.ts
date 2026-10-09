import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination/pagination-query.dto';

export class FindStaffDto extends PaginationQueryDto {
  // Whitelisted explicitly -- IsIn rejects anything else instead of letting
  // an arbitrary field name reach the orderBy clause.
  @IsOptional()
  @IsIn(['name', 'age', 'rating'])
  sortBy?: 'name' | 'age' | 'rating';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';

  // Sent as a single comma-joined query param (?serviceIds=1,3,5) rather
  // than relying on array query-string serialization, which axios and
  // Express don't agree on by default.
  @IsOptional()
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.split(',').map(Number) : value,
  )
  @IsArray()
  @IsInt({ each: true })
  serviceIds?: number[];

  // Free-text, matched against name, place, and contactNumber -- see
  // StaffService.findPaginated for how.
  @IsOptional()
  @IsString()
  search?: string;
}
