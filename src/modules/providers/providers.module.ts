import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiProviderEntity } from './entities/ai-provider.entity';
import { ProvidersService } from './providers.service';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionEntity } from '../subscriptions/entities/subscription.entity';
import { ProviderFactory } from './provider.factory';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { ClaudeAdapter } from './adapters/claude.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { ProvidersController } from './providers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiProviderEntity, SubscriptionEntity]),
    HttpModule,
  ],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    ProviderFactory,
    OpenAiAdapter,
    ClaudeAdapter,
    GeminiAdapter,
  ],
  exports: [ProvidersService, ProviderFactory],
})
export class ProvidersModule {}
