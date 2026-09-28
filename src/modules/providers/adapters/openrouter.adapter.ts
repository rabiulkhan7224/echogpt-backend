import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ChatMessageInput,
  ChatOptions,
  ChatResult,
  ProviderAdapter,
} from './provider-adapter.interface';
import { ProviderType } from '@common/constants/providers.constant';

@Injectable()
export class OpenRouterAdapter implements ProviderAdapter {
  readonly type = ProviderType.OPENROUTER;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private buildHeaders(apiKey: string) {
    return {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Optional but recommended by OpenRouter
      'HTTP-Referer':
        this.config.get<string>('APP_URL') ?? 'http://localhost:3000',
      'X-OpenRouter-Title': this.config.get<string>('appName') ?? 'EchoGPT',
    };
  }

  async chat(
    messages: ChatMessageInput[],
    options: ChatOptions,
    ctx: { apiKey: string; baseUrl?: string | null },
  ): Promise<ChatResult> {
    const url = `${ctx.baseUrl ?? 'https://openrouter.ai/api/v1'}/chat/completions`;

    const { data } = await firstValueFrom(
      this.http.post(
        url,
        {
          model: options.model ?? 'qwen/qwen3.8-27b:free',
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
        },
        { headers: this.buildHeaders(ctx.apiKey) },
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
      const url = `${ctx.baseUrl ?? 'https://openrouter.ai/api/v1'}/models`;
      await firstValueFrom(
        this.http.get(url, { headers: this.buildHeaders(ctx.apiKey) }),
      );
      return true;
    } catch {
      return false;
    }
  }
}
