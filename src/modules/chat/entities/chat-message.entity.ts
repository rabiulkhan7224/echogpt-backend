import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { MessageRole } from '@common/constants/providers.constant';
import { ChatSessionEntity } from './chat-session.entity';
import { AiProviderEntity } from '@modules/providers/entities/ai-provider.entity';

@Entity({ name: 'chat_messages' })
@Index(['sessionId', 'createdAt'])
export class ChatMessageEntity extends BaseEntity {
  @Column({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId?: string | null;

  @Column({ type: 'enum', enum: MessageRole })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'tokens_prompt', type: 'int', nullable: true })
  tokensPrompt?: number | null;

  @Column({ name: 'tokens_output', type: 'int', nullable: true })
  tokensOutput?: number | null;

  @Column({ name: 'latency_ms', type: 'int', nullable: true })
  latencyMs?: number | null;

  @ManyToOne(() => ChatSessionEntity, (s) => s.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: ChatSessionEntity;

  @ManyToOne(() => AiProviderEntity, (p) => p.messages, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: AiProviderEntity | null;
}
