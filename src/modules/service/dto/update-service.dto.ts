import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  abbreviation?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
