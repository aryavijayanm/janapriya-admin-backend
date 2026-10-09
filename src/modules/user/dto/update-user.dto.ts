import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Deliberately no `role` here -- role can only be set at creation, never
// changed afterward, even by an Owner. Enforced here, not just hidden in the UI.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  designation?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // A single field -- "retype to confirm" is a frontend-only check; only one
  // already-confirmed value is ever sent here.
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
