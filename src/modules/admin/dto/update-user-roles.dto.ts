import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { RoleName } from '@common/constants/roles.constant';

export class UpdateUserRolesDto {
  @ApiProperty({ enum: RoleName, isArray: true, example: [RoleName.USER] })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(RoleName, { each: true })
  roles!: RoleName[];
}
