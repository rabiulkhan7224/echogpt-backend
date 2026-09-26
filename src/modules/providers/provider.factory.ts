import { Injectable, NotImplementedException } from '@nestjs/common';
import { ProviderType } from '@common/constants/providers.constant';
import { ProviderAdapter } from './adapters/provider-adapter.interface';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { ClaudeAdapter } from './adapters/claude.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';

@Injectable()
export class ProviderFactory {
  private readonly adapters: Map<ProviderType, ProviderAdapter>;

  constructor(
    openai: OpenAiAdapter,
    claude: ClaudeAdapter,
    gemini: GeminiAdapter,
  ) {
    this.adapters = new Map<ProviderType, ProviderAdapter>([
      [openai.type, openai],
      [claude.type, claude],
      [gemini.type, gemini],
    ]);
  }

  get(type: ProviderType): ProviderAdapter {
    const a = this.adapters.get(type);
    if (!a) throw new NotImplementedException(`No adapter for ${type}`);
    return a;
  }
}
