import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  place: string;

  // Full E.164-style string (e.g. "+919876543210") -- the frontend combines
  // the fixed +91 prefix with the entered digits before submitting.
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  relationshipWithGuardian?: string;

  @IsOptional()
  @IsString()
  guardianContactNumber?: string;

  @IsOptional()
  @IsString()
  verifiedAddress?: string;

  @IsOptional()
  @IsString()
  idProof?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountDetails?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rating?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  serviceIds?: number[];
}
