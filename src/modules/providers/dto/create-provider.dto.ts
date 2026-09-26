import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProviderType } from '@common/constants/providers.constant';

export class CreateProviderDto {
  @ApiProperty({ enum: ProviderType })
  @IsEnum(ProviderType)
  type!: ProviderType;

  @ApiProperty({ example: 'My OpenAI' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'sk-...' })
  @IsString()
  @MinLength(8)
  apiKey!: string;

  @ApiProperty({ example: 'gpt-4o-mini' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  defaultModel!: string;

  @ApiPropertyOptional({ example: 'https://api.openai.com/v1' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  baseUrl?: string;
}
