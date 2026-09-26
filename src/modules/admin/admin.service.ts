import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { RoleEntity } from '@modules/users/entities/role.entity';
import { SubscriptionEntity } from '@modules/subscriptions/entities/subscription.entity';
import { AiProviderEntity } from '@modules/providers/entities/ai-provider.entity';
import { RoleName } from '@common/constants/roles.constant';
import { PlanName, SubscriptionStatus } from '@common/constants/plans.constant';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PlanEntity } from '@modules/subscriptions/entities/plan.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subs: Repository<SubscriptionEntity>,
    @InjectRepository(PlanEntity)
    private readonly plans: Repository<PlanEntity>,
    @InjectRepository(AiProviderEntity)
    private readonly providers: Repository<AiProviderEntity>,
  ) {}

  async listUsers(page: PaginationQueryDto, q?: string) {
    const qb = this.users
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.roles', 'r')
      .orderBy('u.created_at', 'DESC')
      .skip(page.skip)
      .take(page.limit);

    if (q)
      qb.where('u.email ILIKE :q OR u.full_name ILIKE :q', { q: `%${q}%` });

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        isActive: u.isActive,
        roles: u.roles.map((r) => r.name),
        createdAt: u.createdAt,
      })),
      meta: {
        page: page.page,
        limit: page.limit,
        total,
        totalPages: Math.ceil(total / page.limit),
      },
    };
  }

  async getUser(id: string) {
    const u = await this.users.findOne({
      where: { id },
      //    ['roles', 'subscription', 'subscription.plan'],
      relations: {
        roles: true,
        subscription: {
          plan: true,
        },
      },
    });
    if (!u) throw new NotFoundException('User not found');
    return {
      ...u,
      passwordHash: undefined,
    };
  }

  async setUserActive(id: string, isActive: boolean) {
    const u = await this.users.findOneBy({ id });
    if (!u) throw new NotFoundException('User not found');
    u.isActive = isActive;
    return this.users.save(u);
  }

  async setUserRoles(id: string, roleNames: RoleName[]) {
    const u = await this.users.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!u) throw new NotFoundException('User not found');
    const roles = await this.roles.find({
      where: roleNames.map((n) => ({ name: n })),
    });
    u.roles = roles;
    return this.users.save(u);
  }

  async deleteUser(id: string) {
    await this.users.softDelete(id);
  }

  async listSubscriptions(page: PaginationQueryDto) {
    const [items, total] = await this.subs.findAndCount({
      relations: { user: true, plan: true },
      order: { createdAt: 'DESC' },
      skip: page.skip,
      take: page.limit,
    });
    return {
      data: items,
      meta: {
        page: page.page,
        limit: page.limit,
        total,
        totalPages: Math.ceil(total / page.limit),
      },
    };
  }

  async updateSubscription(
    id: string,
    data: { planName?: PlanName; status?: SubscriptionStatus },
  ) {
    const s = await this.subs.findOne({
      where: { id },
      relations: { plan: true },
    });
    if (!s) throw new NotFoundException('Subscription not found');
    if (data.planName) {
      const plan = await this.plans.findOneBy({ name: data.planName });
      if (!plan) throw new NotFoundException('Plan not found');
      s.planId = plan.id;
    }
    if (data.status) s.status = data.status;
    return this.subs.save(s);
  }

  async listProviders(page: PaginationQueryDto) {
    const [items, total] = await this.providers.findAndCount({
      order: { createdAt: 'DESC' },
      skip: page.skip,
      take: page.limit,
    });
    return {
      data: items.map((p) => ({
        id: p.id,
        userId: p.userId,
        type: p.type,
        name: p.name,
        isEnabled: p.isEnabled,
        isDefault: p.isDefault,
        lastHealthyAt: p.lastHealthyAt,
      })),
      meta: {
        page: page.page,
        limit: page.limit,
        total,
        totalPages: Math.ceil(total / page.limit),
      },
    };
  }
}
