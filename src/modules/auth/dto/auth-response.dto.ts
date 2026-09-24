import { ApiProperty } from '@nestjs/swagger';
import { RoleName } from '@common/constants/roles.constant';

export class AuthUserDto {
  @ApiProperty({
    example: 'c2f3e8a1-4b10-4d51-871b-21a48e718bc3',
    description: 'Unique identifier of the user (UUID)',
  })
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  email!: string;

  @ApiProperty({
    example: 'Jane Doe',
    nullable: true,
    required: false,
    description: 'Full name of the user',
  })
  fullName?: string | null;

  @ApiProperty({
    enum: RoleName,
    isArray: true,
    example: [RoleName.USER],
    description: 'Assigned roles for authorization',
  })
  roles!: RoleName[];
}

export class AuthResponseDto {
  @ApiProperty({
    type: AuthUserDto,
    description: 'Authenticated user profile details',
  })
  user!: AuthUserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'd9b2a8c3-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    description: 'JWT Refresh Token',
  })
  refreshToken!: string;

  @ApiProperty({
    example: 900,
    description: 'Access token lifetime in seconds',
  })
  expiresIn!: number;
}
