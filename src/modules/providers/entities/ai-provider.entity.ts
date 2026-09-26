import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { ProviderType } from '@common/constants/providers.constant';
import { UserEntity } from '@modules/users/entities/user.entity';
// import { ChatMessageEntity } from '@modules/chat/entities/chat-message.entity';
// import { ApiUsageLogEntity } from '@modules/usage/entities/api-usage-log.entity';

@Entity({ name: 'ai_providers' })
@Index(['userId'])
@Index(['type'])
export class AiProviderEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ type: 'enum', enum: ProviderType })
  type!: ProviderType;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ name: 'base_url', type: 'varchar', length: 500, nullable: true })
  baseUrl?: string | null;

  @Column({ name: 'default_model', type: 'varchar', length: 120 })
  defaultModel!: string;

  @Column({ name: 'api_key_encrypted', type: 'text' })
  apiKeyEncrypted!: string;

  @Column({ name: 'api_key_iv', type: 'varchar', length: 64 })
  apiKeyIv!: string;

  @Column({ name: 'api_key_tag', type: 'varchar', length: 64 })
  apiKeyTag!: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'last_healthy_at', type: 'timestamptz', nullable: true })
  lastHealthyAt?: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  //   @OneToMany(() => ChatMessageEntity, (m) => m.provider)
  //   messages!: ChatMessageEntity[];

  //   @OneToMany(() => ApiUsageLogEntity, (l) => l.provider)
  //   usageLogs!: ApiUsageLogEntity[];
}
