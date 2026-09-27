import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';
import { AdminService } from './admin.service';
import { UsageService } from '@modules/usage/usage.service';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ParseUuidPipe } from '@common/pipes/parse-uuid.pipe';
import { Roles } from '@common/decorators/roles.decorator';
import { RoleName } from '@common/constants/roles.constant';

import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { UsageLogsQueryDto } from './dto/usage-logs-query.dto';
import { UsageAnalyticsQueryDto } from './dto/usage-analytics-query.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Roles([RoleName.ADMIN])
@Controller('admin')
export class AdminController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly admin: AdminService,
    private readonly usage: UsageService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard statistics' })
  @ApiOkResponse({ description: 'Aggregated counters' })
  dashboard() {
    return this.analytics.dashboard();
  }

  @Get('analytics/usage')
  @ApiOperation({ summary: 'Requests over time (defaults to last 30 days)' })
  usageAnalytics(@Query() q: UsageAnalyticsQueryDto) {
    const from = q.from
      ? new Date(q.from)
      : new Date(Date.now() - 30 * 86400_000);
    const to = q.to ? new Date(q.to) : new Date();
    return this.analytics.usageOverTime(from, to);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with optional search' })
  listUsers(@Query() q: ListUsersQueryDto) {
    return this.admin.listUsers(q, q.q);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user detail' })
  getUser(@Param('id', ParseUuidPipe) id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  setStatus(
    @Param('id', ParseUuidPipe) id: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.admin.setUserActive(id, body.isActive);
  }

  @Patch('users/:id/roles')
  @ApiOperation({ summary: 'Replace a user\u2019s roles' })
  setRoles(
    @Param('id', ParseUuidPipe) id: string,
    @Body() body: UpdateUserRolesDto,
  ) {
    return this.admin.setUserRoles(id, body.roles);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user' })
  async deleteUser(@Param('id', ParseUuidPipe) id: string) {
    await this.admin.deleteUser(id);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List all subscriptions' })
  listSubs(@Query() page: PaginationQueryDto) {
    return this.admin.listSubscriptions(page);
  }

  @Patch('subscriptions/:id')
  @ApiOperation({ summary: 'Update a subscription' })
  updateSub(
    @Param('id', ParseUuidPipe) id: string,
    @Body() body: UpdateSubscriptionDto,
  ) {
    return this.admin.updateSubscription(id, body);
  }

  @Get('providers')
  @ApiOperation({ summary: 'List all providers (system + user)' })
  listProviders(@Query() page: PaginationQueryDto) {
    return this.admin.listProviders(page);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Paginated API usage logs with filters' })
  logs(@Query() q: UsageLogsQueryDto) {
    return this.usage.paginate({
      page: q.page,
      limit: q.limit,
      userId: q.userId,
      endpoint: q.endpoint,
      statusCode: q.statusCode,
      from: q.from ? new Date(q.from) : undefined,
      to: q.to ? new Date(q.to) : undefined,
    });
  }

  @Get('health')
  @ApiOperation({ summary: 'System health for admin' })
  systemHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
