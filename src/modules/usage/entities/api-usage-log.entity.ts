import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { AiProviderEntity } from '@modules/providers/entities/ai-provider.entity';

@Entity({ name: 'api_usage_logs' })
@Index(['userId', 'createdAt'])
@Index(['createdAt'])
@Index(['endpoint'])
export class ApiUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId?: string | null;

  @Column({ type: 'varchar', length: 200 })
  endpoint!: string;

  @Column({ type: 'varchar', length: 10 })
  method!: string;

  @Column({ name: 'status_code', type: 'int' })
  statusCode!: number;

  @Column({ name: 'latency_ms', type: 'int' })
  latencyMs!: number;

  @Column({ name: 'tokens_used', type: 'int', nullable: true })
  tokensUsed?: number | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress?: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  @ManyToOne(() => AiProviderEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: AiProviderEntity | null;
}
