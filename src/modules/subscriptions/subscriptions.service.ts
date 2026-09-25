import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { PlanEntity } from './entities/plan.entity';
import {
  PlanName,
  SubscriptionStatus,
} from '@/common/constants/plans.constant';

export type QuotaResource = 'requests' | 'searches';
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(PlanEntity)
    private readonly plans: Repository<PlanEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subs: Repository<SubscriptionEntity>,
  ) {}

  listPlans(): Promise<PlanEntity[]> {
    return this.plans.find({ order: { priceMonthly: 'ASC' } });
  }

  async getForUser(userId: string): Promise<SubscriptionEntity> {
    const sub = await this.subs.findOne({
      where: { userId },
      relations: {
        plan: true,
      },
    });
    if (!sub) throw new NotFoundException('Subscription not found');
    return sub;
  }

  async createFreeForUser(
    m: EntityManager,
    userId: string,
  ): Promise<SubscriptionEntity> {
    const plan = await m.findOne(PlanEntity, {
      where: { name: PlanName.FREE },
    });
    if (!plan) throw new Error('FREE plan missing — run seeds');

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const sub = m.create(SubscriptionEntity, {
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });
    return m.save(sub);
  }

  async upgrade(userId: string): Promise<SubscriptionEntity> {
    return this.changePlan(userId, PlanName.PREMIUM);
  }

  async downgrade(userId: string): Promise<SubscriptionEntity> {
    return this.changePlan(userId, PlanName.FREE);
  }

  async usage(userId: string) {
    const sub = await this.getForUser(userId);
    return {
      plan: sub.plan.name,
      requests: {
        used: sub.requestsUsed,
        limit: sub.plan.requestLimit,
        remaining: Math.max(0, sub.plan.requestLimit - sub.requestsUsed),
      },
      searches: {
        used: sub.searchesUsed,
        limit: sub.plan.searchLimit,
        remaining: Math.max(0, sub.plan.searchLimit - sub.searchesUsed),
      },
      periodStart: sub.currentPeriodStart,
      periodEnd: sub.currentPeriodEnd,
    };
  }

  /** Throws 403 if user exceeded their quota for the given resource. */
  async assertQuota(userId: string, resource: QuotaResource): Promise<void> {
    const sub = await this.getForUser(userId);
    if (sub.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException('Subscription is not active');
    }
    const used = resource === 'requests' ? sub.requestsUsed : sub.searchesUsed;
    const limit =
      resource === 'requests' ? sub.plan.requestLimit : sub.plan.searchLimit;
    if (used >= limit) {
      throw new ForbiddenException(
        `Quota exceeded for ${resource} (${used}/${limit}). Upgrade your plan.`,
      );
    }
  }

  async incrementUsage(userId: string, resource: QuotaResource): Promise<void> {
    await this.subs
      .createQueryBuilder()
      .update()
      .set(
        resource === 'requests'
          ? { requestsUsed: () => '"requests_used" + 1' }
          : { searchesUsed: () => '"searches_used" + 1' },
      )
      .where('user_id = :userId', { userId })
      .execute();
  }

  private async changePlan(userId: string, planName: PlanName) {
    const sub = await this.getForUser(userId);
    if (sub.plan.name === planName) {
      throw new BadRequestException(`Already on ${planName} plan`);
    }
    const plan = await this.plans.findOne({ where: { name: planName } });
    if (!plan) throw new NotFoundException(`Plan ${planName} not found`);

    sub.planId = plan.id;
    sub.status = SubscriptionStatus.ACTIVE;
    sub.requestsUsed = 0;
    sub.searchesUsed = 0;
    sub.currentPeriodStart = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    sub.currentPeriodEnd = end;

    return this.subs.save(sub);
  }
}
