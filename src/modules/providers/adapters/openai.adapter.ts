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
export class OpenAiAdapter implements ProviderAdapter {
  readonly type = ProviderType.OPENAI;

  constructor(private readonly http: HttpService) {}

  async chat(
    messages: ChatMessageInput[],
    options: ChatOptions,
    ctx: { apiKey: string; baseUrl?: string | null },
  ): Promise<ChatResult> {
    const url = `${ctx.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`;
    const { data } = await firstValueFrom(
      this.http.post(
        url,
        {
          model: options.model ?? 'gpt-4o-mini',
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
        },
        { headers: { Authorization: `Bearer ${ctx.apiKey}` } },
      ),
    );
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      model: data.model,
    };
  }

  async healthCheck(ctx: {
    apiKey: string;
    baseUrl?: string | null;
  }): Promise<boolean> {
    try {
      const url = `${ctx.baseUrl ?? 'https://api.openai.com/v1'}/models`;
      await firstValueFrom(
        this.http.get(url, {
          headers: { Authorization: `Bearer ${ctx.apiKey}` },
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
