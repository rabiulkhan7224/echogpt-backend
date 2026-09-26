import { Injectable, Logger } from '@nestjs/common';
import { SendPromptDto } from './dto/send-prompt.dto';
import { ProvidersService } from '@modules/providers/providers.service';
import { ProviderFactory } from '@modules/providers/provider.factory';
import { ChatSessionsService } from './chat-sessions.service';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { MessageRole } from '@common/constants/providers.constant';
import { ChatMessageInput } from '@modules/providers/adapters/provider-adapter.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly providers: ProvidersService,
    private readonly factory: ProviderFactory,
    private readonly sessions: ChatSessionsService,
    private readonly subs: SubscriptionsService,
    private readonly usage: UsageService,
  ) {}

  async complete(userId: string, dto: SendPromptDto) {
    // 1. quota
    await this.subs.assertQuota(userId, 'requests');

    // 2. resolve session (create if new)
    let sessionId = dto.sessionId;
    if (!sessionId) {
      const session = await this.sessions.create(
        userId,
        dto.providerId ?? null,
      );
      sessionId = session.id;
    } else {
      await this.sessions.get(userId, sessionId); // ownership
    }

    // 3. resolve provider
    const provider = await this.providers.resolveForChat(
      userId,
      dto.providerId,
    );
    const adapter = this.factory.get(provider.type);
    const apiKey = this.providers.decryptKey(provider);

    // 4. build message history (previous messages + current prompt)
    const history = await this.sessions.messagesPaged(userId, sessionId, {
      page: 1,
      limit: 50,
    } as any);

    const messageInput: ChatMessageInput[] = [
      ...history.data.map((m) => ({
        role: m.role.toLowerCase() as ChatMessageInput['role'],
        content: m.content,
      })),
      { role: 'user', content: dto.prompt },
    ];

    // 5. persist user message first
    await this.sessions.appendMessage({
      sessionId,
      role: MessageRole.USER,
      content: dto.prompt,
      providerId: provider.id,
    });
    await this.sessions.maybeAutoTitle(sessionId, dto.prompt);

    // 6. call provider
    const start = Date.now();
    let result;
    try {
      result = await adapter.chat(
        messageInput,
        {
          model: dto.model ?? provider.defaultModel,
          temperature: dto.temperature,
          maxTokens: dto.maxTokens,
        },
        { apiKey, baseUrl: provider.baseUrl },
      );
    } catch (err) {
      this.logger.error(`Provider call failed: ${(err as Error).message}`);
      await this.usage.log({
        userId,
        providerId: provider.id,
        endpoint: '/chat/completions',
        method: 'POST',
        statusCode: 502,
        latencyMs: Date.now() - start,
        errorMessage: (err as Error).message,
      });
      throw err;
    }

    const latencyMs = Date.now() - start;

    // 7. persist assistant response
    const assistantMsg = await this.sessions.appendMessage({
      sessionId,
      role: MessageRole.ASSISTANT,
      content: result.content,
      providerId: provider.id,
      tokensPrompt: result.promptTokens ?? null,
      tokensOutput: result.completionTokens ?? null,
      latencyMs,
    });

    // 8. increment usage + audit log
    await this.subs.incrementUsage(userId, 'requests');
    await this.usage.log({
      userId,
      providerId: provider.id,
      endpoint: '/chat/completions',
      method: 'POST',
      statusCode: 200,
      latencyMs,
      tokensUsed: (result.promptTokens ?? 0) + (result.completionTokens ?? 0),
    });

    return {
      sessionId,
      messageId: assistantMsg.id,
      provider: provider.type,
      model: result.model,
      content: result.content,
      usage: {
        promptTokens: result.promptTokens ?? null,
        completionTokens: result.completionTokens ?? null,
      },
      latencyMs,
    };
  }
}
