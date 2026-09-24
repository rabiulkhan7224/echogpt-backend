import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() total!: number;
  @ApiProperty() totalPages!: number;
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: true }) success!: boolean;
  @ApiProperty({ example: 200 }) statusCode!: number;
  @ApiProperty({ example: 'OK' }) message!: string;
  data!: T;

  @ApiProperty({ type: PaginationMetaDto, required: false })
  meta?: PaginationMetaDto;
}
