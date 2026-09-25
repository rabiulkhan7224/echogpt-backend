import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { SubscriptionStatus } from '@common/constants/plans.constant';
import { UserEntity } from '@modules/users/entities/user.entity';
import { PlanEntity } from './plan.entity';

@Entity({ name: 'subscriptions' })
@Index(['userId'], { unique: true })
@Index(['status'])
export class SubscriptionEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({ name: 'requests_used', type: 'int', default: 0 })
  requestsUsed!: number;

  @Column({ name: 'searches_used', type: 'int', default: 0 })
  searchesUsed!: number;

  @Column({ name: 'current_period_start', type: 'timestamptz' })
  currentPeriodStart!: Date;

  @Column({ name: 'current_period_end', type: 'timestamptz' })
  currentPeriodEnd!: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date | null;

  @OneToOne(() => UserEntity, (u) => u.subscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => PlanEntity, (p) => p.subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan!: PlanEntity;
}
