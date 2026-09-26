import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSessionEntity } from './entities/chat-session.entity';
import { ChatMessageEntity } from './entities/chat-message.entity';
import { ProvidersModule } from '../providers/providers.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ChatController } from './chat.controller';
import { ChatSessionsController } from './chat-sessions.controller';
import { ChatService } from './chat.service';
import { ChatSessionsService } from './chat-sessions.service';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSessionEntity, ChatMessageEntity]),
    ProvidersModule,
    SubscriptionsModule,
    UsageModule,
  ],
  controllers: [ChatController, ChatSessionsController],
  providers: [ChatService, ChatSessionsService],
  exports: [ChatSessionsService],
})
export class ChatModule {}
