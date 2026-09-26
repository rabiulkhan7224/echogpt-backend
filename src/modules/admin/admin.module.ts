import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { RoleEntity } from './../users/entities/role.entity';
import { SubscriptionEntity } from '@modules/subscriptions/entities/subscription.entity';
import { PlanEntity } from './../subscriptions/entities/plan.entity';
import { AiProviderEntity } from '@modules/providers/entities/ai-provider.entity';
import { ApiUsageLogEntity } from '@modules/usage/entities/api-usage-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      SubscriptionEntity,
      PlanEntity,
      AiProviderEntity,
      ApiUsageLogEntity,
    ]),
    UsageModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AnalyticsService],
})
export class AdminModule {}
