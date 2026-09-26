import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { SubscriptionEntity } from '@modules/subscriptions/entities/subscription.entity';
import { AiProviderEntity } from '@modules/providers/entities/ai-provider.entity';
import { ApiUsageLogEntity } from '@modules/usage/entities/api-usage-log.entity';
import { PlanName } from '@common/constants/plans.constant';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subs: Repository<SubscriptionEntity>,
    @InjectRepository(AiProviderEntity)
    private readonly providers: Repository<AiProviderEntity>,
    @InjectRepository(ApiUsageLogEntity)
    private readonly logs: Repository<ApiUsageLogEntity>,
  ) {}

  async dashboard() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      newToday,
      premiumCount,
      freeCount,
      totalProviders,
      enabledProviders,
      requestsToday,
      requestsMonth,
    ] = await Promise.all([
      this.users.count(),
      this.users.count({ where: { isActive: true } }),
      this.users.count({ where: { createdAt: Between(startOfDay, now) } }),
      this.subs
        .createQueryBuilder('s')
        .leftJoin('s.plan', 'p')
        .where('p.name = :name', { name: PlanName.PREMIUM })
        .getCount(),
      this.subs
        .createQueryBuilder('s')
        .leftJoin('s.plan', 'p')
        .where('p.name = :name', { name: PlanName.FREE })
        .getCount(),
      this.providers.count(),
      this.providers.count({ where: { isEnabled: true } }),
      this.logs.count({ where: { createdAt: Between(startOfDay, now) } }),
      this.logs.count({ where: { createdAt: Between(startOfMonth, now) } }),
    ]);

    const topProviders = await this.logs
      .createQueryBuilder('l')
      .leftJoin('l.provider', 'p')
      .select('p.type', 'type')
      .addSelect('COUNT(l.id)', 'requests')
      .where('l.created_at >= :start', { start: startOfMonth })
      .andWhere('p.id IS NOT NULL')
      .groupBy('p.type')
      .orderBy('requests', 'DESC')
      .limit(5)
      .getRawMany<{ type: string; requests: string }>();

    return {
      users: { total: totalUsers, active: activeUsers, newToday },
      subscriptions: { free: freeCount, premium: premiumCount },
      requests: { today: requestsToday, thisMonth: requestsMonth },
      providers: { total: totalProviders, enabled: enabledProviders },
      topProviders: topProviders.map((t) => ({
        type: t.type,
        requests: Number(t.requests),
      })),
    };
  }

  async usageOverTime(from: Date, to: Date) {
    const rows = await this.logs
      .createQueryBuilder('l')
      .select("date_trunc('day', l.created_at)", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('l.created_at BETWEEN :from AND :to', { from, to })
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; count: string }>();

    return rows.map((r) => ({ day: r.day, count: Number(r.count) }));
  }
}
