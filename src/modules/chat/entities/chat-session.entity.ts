import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { UserEntity } from '@modules/users/entities/user.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Entity({ name: 'chat_sessions' })
@Index(['userId', 'updatedAt'])
export class ChatSessionEntity extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 200, default: 'New Chat' })
  title!: string;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId?: string | null;

  @ManyToOne(() => UserEntity, (u) => u.chatSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @OneToMany(() => ChatMessageEntity, (m) => m.session, { cascade: true })
  messages!: ChatMessageEntity[];
}
