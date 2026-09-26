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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AdminService } from './admin.service';
import { UsageService } from '@modules/usage/usage.service';
import { Roles } from '@common/decorators/roles.decorator';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { ParseUuidPipe } from '@common/pipes/parse-uuid.pipe';
import { PlanName, SubscriptionStatus } from '@common/constants/plans.constant';
import { RoleName } from '@/common/constants/roles.constant';

class UpdateUserStatusDto {
  isActive!: boolean;
}
class UpdateUserRolesDto {
  roles!: RoleName[];
}
class UpdateSubscriptionDto {
  planName?: PlanName;
  status?: SubscriptionStatus;
}

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
  dashboard() {
    return this.analytics.dashboard();
  }

  @Get('analytics/usage')
  @ApiOperation({ summary: 'Requests over time' })
  usageAnalytics(@Query('from') from: string, @Query('to') to: string) {
    const f = from ? new Date(from) : new Date(Date.now() - 30 * 86400_000);
    const t = to ? new Date(to) : new Date();
    return this.analytics.usageOverTime(f, t);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  listUsers(@Query() page: PaginationQueryDto, @Query('q') q?: string) {
    return this.admin.listUsers(page, q);
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
  @ApiOperation({ summary: 'Assign roles to a user' })
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
  @ApiOperation({ summary: 'Paginated API usage logs' })
  logs(
    @Query() page: PaginationQueryDto,
    @Query('userId') userId?: string,
    @Query('endpoint') endpoint?: string,
    @Query('statusCode') statusCode?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.usage.paginate({
      page: page.page,
      limit: page.limit,
      userId,
      endpoint,
      statusCode: statusCode ? Number(statusCode) : undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('health')
  @ApiOperation({ summary: 'System health for admin' })
  async systemHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
