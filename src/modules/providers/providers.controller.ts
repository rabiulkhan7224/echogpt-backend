import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ParseUuidPipe } from '@/common/pipes/parse-uuid.pipe';

@ApiTags('providers')
@ApiBearerAuth('access-token')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly svc: ProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'List user + system providers' })
  list(@CurrentUser() u: AuthenticatedUser) {
    return this.svc.listForUser(u.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new AI provider' })
  create(@CurrentUser() u: AuthenticatedUser, @Body() dto: CreateProviderDto) {
    return this.svc.create(u.id, dto);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health-check all enabled providers' })
  health(@CurrentUser() u: AuthenticatedUser) {
    return this.svc.healthCheckAll(u.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single provider' })
  getOne(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    return this.svc.getOne(u.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a provider' })
  update(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.svc.update(u.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a provider' })
  async remove(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    await this.svc.delete(u.id, id);
  }

  @Patch(':id/enable')
  @ApiOperation({ summary: 'Enable a provider' })
  enable(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    return this.svc.setEnabled(u.id, id, true);
  }

  @Patch(':id/disable')
  @ApiOperation({ summary: 'Disable a provider' })
  disable(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    return this.svc.setEnabled(u.id, id, false);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set provider as default' })
  setDefault(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    return this.svc.setDefault(u.id, id);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Health-check a single provider' })
  healthOne(
    @CurrentUser() u: AuthenticatedUser,
    @Param('id', ParseUuidPipe) id: string,
  ) {
    return this.svc.healthCheckOne(u.id, id);
  }
}
