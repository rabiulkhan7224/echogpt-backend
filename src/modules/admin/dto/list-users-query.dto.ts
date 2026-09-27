import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'rabiul',
    description: 'Search email or full name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
