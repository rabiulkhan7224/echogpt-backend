import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { SessionEntity } from '@modules/sessions/entities/session.entity';
import { BaseEntity } from '@/common/entities/base.entity';
// import { SubscriptionEntity } from '@modules/subscriptions/entities/subscription.entity';
// import { ChatSessionEntity } from '@modules/chat/entities/chat-session.entity';
// import { WebSearchEntity } from '@modules/search/entities/web-search.entity';
// import { ApiUsageLogEntity } from '@modules/usage/entities/api-usage-log.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 120, nullable: false })
  fullName!: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToMany(() => RoleEntity, (r) => r.users, { cascade: ['insert'] })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: RoleEntity[];

  @OneToMany(() => SessionEntity, (s) => s.user)
  sessions!: SessionEntity[];

  //   @OneToOne(() => SubscriptionEntity, (s) => s.user)
  //   subscription?: SubscriptionEntity;

  //   @OneToMany(() => ChatSessionEntity, (c) => c.user)
  //   chatSessions!: ChatSessionEntity[];

  //   @OneToMany(() => WebSearchEntity, (w) => w.user)
  //   searches!: WebSearchEntity[];

  //   @OneToMany(() => ApiUsageLogEntity, (l) => l.user)
  //   usageLogs!: ApiUsageLogEntity[];
}
