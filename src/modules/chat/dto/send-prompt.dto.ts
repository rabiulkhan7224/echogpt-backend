import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class SendPromptDto {
  @ApiPropertyOptional({
    description: 'Existing session id, or null to create new',
  })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Provider id (user or system)' })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiProperty({ example: 'Explain JWT refresh rotation' })
  @IsString()
  @MinLength(1)
  prompt!: string;

  @ApiPropertyOptional({ example: 'gpt-4o-mini' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 0.7, minimum: 0, maximum: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({ example: 1024 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8192)
  maxTokens?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  stream?: boolean;
}
