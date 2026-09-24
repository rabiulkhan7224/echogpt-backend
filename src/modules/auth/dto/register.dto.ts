import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  email!: string;

  @ApiProperty({
    example: 'S3cure!pass',
    minLength: 8,
    maxLength: 72,
    description: 'User password (minimum 8 characters, maximum 72)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password cannot exceed 72 characters' })
  password!: string;

  @ApiProperty({
    example: 'Jane Doe',
    maxLength: 120,
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(({ value }: { value: string }) => value?.trim())
  fullName!: string;
}
