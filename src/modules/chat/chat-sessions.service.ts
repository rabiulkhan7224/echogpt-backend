import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@Injectable()
export class ChatSessionsService {
  constructor(
    @InjectRepository(ChatSessionEntity)
    private readonly sessions: Repository<ChatSessionEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messages: Repository<ChatMessageEntity>,
  ) {}

  async list(userId: string, page: PaginationQueryDto) {
    const [items, total] = await this.sessions.findAndCount({
      where: { userId },
      order: { updatedAt: 'DESC' },
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

  async get(userId: string, id: string) {
    const s = await this.sessions.findOne({ where: { id, userId } });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  async create(
    userId: string,
    providerId?: string | null,
  ): Promise<ChatSessionEntity> {
    const s = this.sessions.create({
      userId,
      providerId: providerId ?? null,
      title: 'New Chat',
    });
    return this.sessions.save(s);
  }

  async rename(userId: string, id: string, title: string) {
    const s = await this.get(userId, id);
    s.title = title;
    return this.sessions.save(s);
  }

  async remove(userId: string, id: string) {
    const s = await this.get(userId, id);
    await this.sessions.softDelete(s.id);
  }

  async messagesPaged(userId: string, id: string, page: PaginationQueryDto) {
    await this.get(userId, id);
    const [items, total] = await this.messages.findAndCount({
      where: { sessionId: id },
      order: { createdAt: 'ASC' },
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

  async appendMessage(data: {
    sessionId: string;
    role: ChatMessageEntity['role'];
    content: string;
    providerId?: string | null;
    tokensPrompt?: number | null;
    tokensOutput?: number | null;
    latencyMs?: number | null;
  }): Promise<ChatMessageEntity> {
    const m = this.messages.create(data);
    return this.messages.save(m);
  }

  async maybeAutoTitle(sessionId: string, firstPrompt: string) {
    const s = await this.sessions.findOne({ where: { id: sessionId } });
    if (!s) return;
    if (s.title !== 'New Chat') return;
    s.title = firstPrompt.slice(0, 60);
    await this.sessions.save(s);
  }
}
