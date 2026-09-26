import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('db')
  @ApiOperation({ summary: 'Postgres ping' })
  async db() {
    try {
      await this.ds.query('SELECT 1');
      return { status: 'ok', db: 'up' };
    } catch (e) {
      return { status: 'degraded', db: 'down', error: (e as Error).message };
    }
  }
}
