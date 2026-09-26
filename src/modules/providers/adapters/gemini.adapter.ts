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
export class GeminiAdapter implements ProviderAdapter {
  readonly type = ProviderType.GEMINI;

  constructor(private readonly http: HttpService) {}

  async chat(
    messages: ChatMessageInput[],
    options: ChatOptions,
    ctx: { apiKey: string; baseUrl?: string | null },
  ): Promise<ChatResult> {
    const model = options.model ?? 'gemini-1.5-flash';
    const base =
      ctx.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
    const url = `${base}/models/${model}:generateContent?key=${ctx.apiKey}`;

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const { data } = await firstValueFrom(
      this.http.post(url, {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens,
        },
      }),
    );

    return {
      content:
        data.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text)
          .join('') ?? '',
      promptTokens: data.usageMetadata?.promptTokenCount,
      completionTokens: data.usageMetadata?.candidatesTokenCount,
      model,
    };
  }

  async healthCheck(ctx: {
    apiKey: string;
    baseUrl?: string | null;
  }): Promise<boolean> {
    try {
      const base =
        ctx.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
      await firstValueFrom(this.http.get(`${base}/models?key=${ctx.apiKey}`));
      return true;
    } catch {
      return false;
    }
  }
}
