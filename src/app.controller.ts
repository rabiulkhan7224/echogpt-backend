import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'API landing' })
  root() {
    return {
      name: this.config.get<string>('appName') ?? 'EchoGPT API',
      version: '1.0.0',
      docs: `/${this.config.get<string>('swagger.path') ?? 'api/docs'}`,
      health: `/${this.config.get<string>('apiPrefix') ?? 'api/v1'}/health`,
    };
  }
}
