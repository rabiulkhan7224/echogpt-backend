import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import type { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  @Public()
  @Get('plans')
  @ApiOperation({ summary: 'List all available plans' })
  listPlans() {
    return this.subs.listPlans();
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get current subscription' })
  getMine(@CurrentUser() user: AuthenticatedUser) {
    return this.subs.getForUser(user.id);
  }

  @ApiBearerAuth('access-token')
  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to PREMIUM' })
  @ApiOkResponse()
  upgrade(@CurrentUser() user: AuthenticatedUser) {
    return this.subs.upgrade(user.id);
  }

  @ApiBearerAuth('access-token')
  @Post('downgrade')
  @ApiOperation({ summary: 'Downgrade to FREE' })
  downgrade(@CurrentUser() user: AuthenticatedUser) {
    return this.subs.downgrade(user.id);
  }

  @ApiBearerAuth('access-token')
  @Get('usage')
  @ApiOperation({ summary: 'Get current usage counters' })
  usage(@CurrentUser() user: AuthenticatedUser) {
    return this.subs.usage(user.id);
  }

  @ApiBearerAuth('access-token')
  @Get('remaining')
  @ApiOperation({ summary: 'Remaining requests and searches' })
  remaining(@CurrentUser() user: AuthenticatedUser) {
    return this.subs.usage(user.id);
  }
}
