import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({ example: 'nestjs typeorm migrations' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  q!: string;
}
