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
  @IsNotEmpty({ message: 'Email cannot be empty' })
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
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password cannot exceed 72 characters' })
  password!: string;

  @ApiProperty({
    example: 'Jane Doe',
    maxLength: 120,
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'fullName cannot be empty.' })
  @MinLength(3)
  @MaxLength(96)
  fullName!: string;
}
