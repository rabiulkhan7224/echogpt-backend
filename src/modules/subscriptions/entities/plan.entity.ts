import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { PlanName } from '@common/constants/plans.constant';
import { SubscriptionEntity } from './subscription.entity';

@Entity({ name: 'plans' })
export class PlanEntity extends BaseEntity {
  @Column({ type: 'enum', enum: PlanName, unique: true })
  name!: PlanName;

  @Column({ name: 'price_monthly', type: 'numeric', precision: 10, scale: 2 })
  priceMonthly!: string;

  @Column({ name: 'request_limit', type: 'int' })
  requestLimit!: number;

  @Column({ name: 'search_limit', type: 'int' })
  searchLimit!: number;

  @Column({ name: 'provider_limit', type: 'int' })
  providerLimit!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  features!: Record<string, unknown>;

  @OneToMany(() => SubscriptionEntity, (s) => s.plan)
  subscriptions!: SubscriptionEntity[];
}
