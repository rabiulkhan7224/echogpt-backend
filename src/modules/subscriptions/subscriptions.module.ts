import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanEntity } from './entities/plan.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanEntity, SubscriptionEntity]), // ← both
  ],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}
