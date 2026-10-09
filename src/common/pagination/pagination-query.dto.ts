import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

// Shared base -- any entity-specific query DTO (filters, sort fields, etc.)
// can extend this later instead of redefining page handling each time.
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
