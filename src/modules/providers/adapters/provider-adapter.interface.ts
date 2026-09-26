import { ProviderType } from '@common/constants/providers.constant';

export interface ChatMessageInput {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResult {
  content: string;
  promptTokens?: number;
  completionTokens?: number;
  model: string;
}

export interface ProviderAdapter {
  readonly type: ProviderType;
  chat(
    messages: ChatMessageInput[],
    options: ChatOptions,
    ctx: { apiKey: string; baseUrl?: string | null },
  ): Promise<ChatResult>;

  healthCheck(ctx: {
    apiKey: string;
    baseUrl?: string | null;
  }): Promise<boolean>;
}
