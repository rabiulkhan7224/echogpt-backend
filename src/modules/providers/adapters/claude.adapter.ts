import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  ChatMessageInput,
  ChatOptions,
  ChatResult,
  ProviderAdapter,
} from './provider-adapter.interface';
import { ProviderType } from '@common/constants/providers.constant';

@Injectable()
export class ClaudeAdapter implements ProviderAdapter {
  readonly type = ProviderType.CLAUDE;

  constructor(private readonly http: HttpService) {}

  async chat(
    messages: ChatMessageInput[],
    options: ChatOptions,
    ctx: { apiKey: string; baseUrl?: string | null },
  ): Promise<ChatResult> {
    const url = `${ctx.baseUrl ?? 'https://api.anthropic.com/v1'}/messages`;

    // Claude: system is a top-level field, not a message
    const system = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n');
    const rest = messages.filter((m) => m.role !== 'system');

    const { data } = await firstValueFrom(
      this.http.post(
        url,
        {
          model: options.model ?? 'claude-3-5-sonnet-latest',
          system: system || undefined,
          messages: rest,
          max_tokens: options.maxTokens ?? 1024,
          temperature: options.temperature ?? 0.7,
        },
        {
          headers: {
            'x-api-key': ctx.apiKey,
            'anthropic-version': '2023-06-01',
          },
        },
      ),
    );
    return {
      content: data.content?.[0]?.text ?? '',
      promptTokens: data.usage?.input_tokens,
      completionTokens: data.usage?.output_tokens,
      model: data.model,
    };
  }

  async healthCheck(ctx: {
    apiKey: string;
    baseUrl?: string | null;
  }): Promise<boolean> {
    try {
      const url = `${ctx.baseUrl ?? 'https://api.anthropic.com/v1'}/models`;
      await firstValueFrom(
        this.http.get(url, {
          headers: {
            'x-api-key': ctx.apiKey,
            'anthropic-version': '2023-06-01',
          },
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
