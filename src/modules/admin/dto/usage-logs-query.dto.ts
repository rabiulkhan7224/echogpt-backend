import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

export class UsageLogsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: '/chat/completions' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ example: 200, minimum: 100, maximum: 599 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(599)
  statusCode?: number;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00Z', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59Z', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
