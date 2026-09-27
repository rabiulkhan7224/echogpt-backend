import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UsageAnalyticsQueryDto {
  @ApiPropertyOptional({ format: 'date-time', example: '2026-09-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: 'date-time', example: '2026-09-30T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
